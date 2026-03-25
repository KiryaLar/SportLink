package ru.larkin.gatewayservice.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
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

@Service
class KeycloakAdminService(

    @Value("\${keycloak.realm}")
    private val realm: String,

    @Value("\${keycloak.admin-username}")
    private val adminUsername: String,

    @Value("\${keycloak.admin-password}")
    private val adminPassword: String,

    private val restClient: RestClient
) {

    private val log = LoggerFactory.getLogger(KeycloakAdminService::class.java)

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

        log.info("User created successfully in Keycloak: userId={}", userId)

        return userId
    }

    /**
     * Логин пользователя через OIDC endpoint
     */
    fun login(email: String, password: String): TokenResponse {
        log.info("Logging in user: email={}", email)

        val tokenUrl = "/realms/$realm/protocol/openid-connect/token"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
        }

        val body = "grant_type=password" +
                "&client_id=gateway-service" +
                "&username=$email" +
                "&password=$password"

        try {
            val response = restClient.post()
                .uri(tokenUrl)
                .headers { it.addAll(headers) }
                .body(body)
                .retrieve()
                .body<KeycloakTokenResponse>()
                ?: throw KeycloakAuthenticationException("Ошибка получения токенов")

            return TokenResponse(
                accessToken = response.accessToken,
                refreshToken = response.refreshToken ?: "",
                expiresIn = response.expiresIn.toLong()
            )
        } catch (e: Exception) {
            log.error("Login failed for user $email: ${e.message}")
            throw KeycloakAuthenticationException("Неверный email или пароль")
        }
    }

    /**
     * Получение admin access token
     */
    private fun getAdminToken(): String {
        val tokenUrl = "/realms/master/protocol/openid-connect/token"

        val body = "grant_type=password" +
                "&client_id=admin-cli" +
                "&username=$adminUsername" +
                "&password=$adminPassword"

        var response = (restClient.post()
            .uri(tokenUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(body)
            .retrieve()
            .body<KeycloakTokenResponse>()
            ?: throw KeycloakAdminException("Не удалось получить admin token"))

        return response.accessToken
    }

    /**
     * Поиск пользователя по email
     */
    private fun findUserByEmail(email: String, token: String): String? {
        val url = "/admin/realms/$realm/users?email=$email&exact=true"

        val headers = HttpHeaders().apply {
            set("Authorization", "Bearer $token")
        }

        val request = HttpEntity<String>(headers)

        try {
            var response = restClient.get()
                .uri(url)
                .headers { it.addAll(headers) }
                .retrieve()
                .body<Array<UserRepresentation>>()

            return response?.firstOrNull()?.id
        } catch (e: Exception) {
            log.warn("Error finding user by email: ${e.message}")
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

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            set("Authorization", "Bearer $token")
        }

        val body = mapOf(
            "username" to email,
            "email" to email,
            "firstName" to name,
            "enabled" to true,
            "emailVerified" to true,
            "attributes" to mapOf(
                "name" to listOf(name),
                "phone" to listOfNotNull(phone)
            )
        )

        val response = restClient.post()
            .uri(url)
            .headers { it.addAll(headers) }
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

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            set("Authorization", "Bearer $token")
        }

        val body = mapOf(
            "type" to "password",
            "value" to password,
            "temporary" to false
        )

        restClient.post()
            .uri(url)
            .headers { it.addAll(headers) }
            .body(body)
            .retrieve()
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
