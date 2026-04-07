package ru.larkin.gatewayservice.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.client.body
import ru.larkin.gatewayservice.dto.resp.KeycloakTokenResponse
import ru.larkin.gatewayservice.dto.resp.TokenResponse
import ru.larkin.gatewayservice.exception.KeycloakAdminException
import ru.larkin.gatewayservice.exception.KeycloakAuthenticationException
import ru.larkin.gatewayservice.exception.KeycloakCreationException
import ru.larkin.gatewayservice.exception.UserAlreadyExistsException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Service
class KeycloakAdminService(

    @Value("\${keycloak.realm}")
    private val realm: String,

    @Value("\${keycloak.client-id:gateway-service}")
    private val clientId: String,

    @Value("\${keycloak.client-secret}")
    private val clientSecret: String,

    private val restClient: RestClient
) {

    private val log = LoggerFactory.getLogger(KeycloakAdminService::class.java)

    private val tokenUrl get() = "/realms/$realm/protocol/openid-connect/token"
    private val logoutUrl get() = "/realms/$realm/protocol/openid-connect/logout"

    /**
     * Создаёт пользователя в Keycloak через Admin REST API
     */
    fun createUser(
        email: String,
        password: String,
        name: String,
        phone: String? = null
    ): String {
        log.info("Creating user in Keycloak: email={}, name={}", email, name)

        val token = getAdminToken()

        val existingUser = findUserByEmail(email, token)
        if (existingUser != null) {
            throw UserAlreadyExistsException("Пользователь с email $email уже существует")
        }

        val userId = createKeycloakUser(email, name, phone, token)
        setPassword(userId, password, token)
        clearRequiredActions(userId, token)

        log.info("User created successfully in Keycloak: userId={}", userId)
        return userId
    }

    /**
     * Логин пользователя через OIDC token endpoint (ROPC grant)
     */
    fun login(email: String, password: String): TokenResponse {
        log.info("Logging in user: email={}", email)

        val body = formEncode(
            "grant_type" to "password",
            "client_id" to clientId,
            "client_secret" to clientSecret,
            "username" to email,
            "password" to password
        )

        return requestToken(body) ?: throw KeycloakAuthenticationException("Неверный email или пароль")
    }

    /**
     * Обновление токена через refresh_token grant
     */
    fun refreshToken(refreshToken: String): TokenResponse {
        log.debug("Refreshing token")

        val body = formEncode(
            "grant_type" to "refresh_token",
            "client_id" to clientId,
            "client_secret" to clientSecret,
            "refresh_token" to refreshToken
        )

        return requestToken(body) ?: throw KeycloakAuthenticationException("Невалидный refresh token")
    }

    /**
     * Отзыв refresh-токена через Keycloak logout endpoint
     */
    fun revokeToken(refreshToken: String) {
        log.debug("Revoking refresh token")

        val body = formEncode(
            "client_id" to clientId,
            "client_secret" to clientSecret,
            "refresh_token" to refreshToken
        )

        try {
            restClient.post()
                .uri(logoutUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .toBodilessEntity()
        } catch (e: Exception) {
            log.warn("Token revocation failed (may be already expired): {}", e.message)
        }
    }

    // ------------- Private helpers -------------

    private fun requestToken(formBody: String): TokenResponse? {
        try {
            val response = restClient.post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formBody)
                .retrieve()
                .body<KeycloakTokenResponse>()
                ?: return null

            return TokenResponse(
                accessToken = response.accessToken,
                refreshToken = response.refreshToken ?: "",
                expiresIn = response.expiresIn.toLong()
            )
        } catch (e: Exception) {
            log.error("Token request failed: {}", e.message)
            throw KeycloakAuthenticationException("Ошибка аутентификации", e)
        }
    }

    /**
     * Получение admin access token через client_credentials grant.
     * gateway-service — confidential клиент с serviceAccountsEnabled=true,
     * его service account имеет роли manage-users + view-users из realm-management.
     * Никаких username/password не требуется.
     */
    private fun getAdminToken(): String {
        val body = formEncode(
            "grant_type" to "client_credentials",
            "client_id" to clientId,
            "client_secret" to clientSecret
        )

        val response = restClient.post()
            .uri(tokenUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(body)
            .retrieve()
            .body<KeycloakTokenResponse>()
            ?: throw KeycloakAdminException("Не удалось получить admin token")

        return response.accessToken
    }

    /**
     * Поиск пользователя по email
     */
    private fun findUserByEmail(email: String, token: String): String? {
        val encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8)
        val url = "/admin/realms/$realm/users?email=$encodedEmail&exact=true"

        val headers = HttpHeaders().apply {
            set("Authorization", "Bearer $token")
        }

        try {
            val response = restClient.get()
                .uri(url)
                .headers { it.addAll(headers) }
                .retrieve()
                .body<Array<UserRepresentation>>()

            return response?.firstOrNull()?.id
        } catch (e: Exception) {
            log.warn("Error finding user by email: {}", e.message)
            return null
        }
    }

    /**
     * Создание пользователя в Keycloak
     */
    private fun createKeycloakUser(
        email: String,
        name: String,
        phone: String?,
        token: String
    ): String {
        val url = "/admin/realms/$realm/users"

        val parts = name.trim().split(" ", limit = 2)
        val firstName = parts[0]
        val lastName = parts.getOrElse(1) { parts[0] }

        val body = mapOf(
            "username" to email,
            "email" to email,
            "firstName" to firstName,
            "lastName" to lastName,
            "enabled" to true,
            "emailVerified" to true,
            "requiredActions" to emptyList<String>(),
            "attributes" to mapOf(
                "name" to listOf(name),
                "phone" to listOfNotNull(phone)
            )
        )

        val response = restClient.post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer $token")
            .body(body)
            .retrieve()
            .toBodilessEntity()

        val location = response.headers.location
            ?: throw KeycloakCreationException("Не удалось получить ID созданного пользователя")

        return location.path.substringAfterLast("/")
    }

    /**
     * Установка пароля пользователю
     */
    private fun setPassword(userId: String, password: String, token: String) {
        val url = "/admin/realms/$realm/users/$userId/reset-password"

        val body = mapOf(
            "type" to "password",
            "value" to password,
            "temporary" to false
        )

        restClient.put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer $token")
            .body(body)
            .retrieve()
            .toBodilessEntity()
    }

    /**
     * Сбрасывает все required actions у пользователя.
     * Fetches the full user representation first, then re-submits with empty requiredActions
     * to avoid Keycloak ignoring a partial PUT body.
     */
    private fun clearRequiredActions(userId: String, token: String) {
        val url = "/admin/realms/$realm/users/$userId"

        val user = restClient.get()
            .uri(url)
            .header("Authorization", "Bearer $token")
            .retrieve()
            .body<Map<String, Any>>()
            ?: return

        val existingActions = @Suppress("UNCHECKED_CAST") (user["requiredActions"] as? List<String>) ?: emptyList()
        log.info("Required actions before clear for user {}: {}", userId, existingActions)

        val updated = user.toMutableMap()
        updated["requiredActions"] = emptyList<String>()

        restClient.put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer $token")
            .body(updated)
            .retrieve()
            .toBodilessEntity()

        log.info("Required actions cleared for user {}", userId)
    }

    private fun formEncode(vararg pairs: Pair<String, String>): String {
        return pairs.joinToString("&") { (k, v) ->
            "${URLEncoder.encode(k, StandardCharsets.UTF_8)}=${URLEncoder.encode(v, StandardCharsets.UTF_8)}"
        }
    }
}

data class UserRepresentation(
    val id: String,
    val username: String,
    val email: String?,
    val firstName: String?,
    val lastName: String?,
    val enabled: Boolean,
    val emailVerified: Boolean
)
