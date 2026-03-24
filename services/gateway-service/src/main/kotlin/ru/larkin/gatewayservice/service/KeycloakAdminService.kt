package ru.larkin.gatewayservice.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.client.RestTemplate
import java.net.InetAddress

@Service
class KeycloakAdminService(
    @Value("\${keycloak.admin-server-url}")
    private val adminServerUrl: String,

    @Value("\${keycloak.realm}")
    private val realm: String,

    @Value("\${keycloak.admin-username}")
    private val adminUsername: String,

    @Value("\${keycloak.admin-password}")
    private val adminPassword: String
) {

    private val log = LoggerFactory.getLogger(KeycloakAdminService::class.java)

    private val restTemplate: RestTemplate = RestTemplate(
        SimpleClientHttpRequestFactory().apply {
            setConnectTimeout(5000)
            setReadTimeout(5000)
        }
    )

    /**
     * Создаёт пользователя в Keycloak через Admin REST API
     */
    @Transactional
    fun createUser(
        email: String,
        password: String,
        name: String,
        phone: String? = null
    ): String {
        log.info("Creating user in Keycloak: email={}, name={}", email, name)

        val token = getAdminToken()

        // Проверяем, существует ли уже пользователь
        val existingUser = findUserByEmail(email, token)
        if (existingUser != null) {
            throw UserAlreadyExistsException("Пользователь с email $email уже существует")
        }

        // Создаём пользователя
        val userId = createKeycloakUser(email, name, phone, token)

        // Устанавливаем пароль
        setPassword(userId, password, token)

        log.info("User created successfully in Keycloak: userId={}", userId)

        return userId
    }

    /**
     * Логин пользователя через OIDC endpoint
     */
    fun login(email: String, password: String): TokenResponse {
        log.info("Logging in user: email={}", email)

        val tokenUrl = "$adminServerUrl/realms/$realm/protocol/openid-connect/token"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
        }

        val body = "grant_type=password" +
                "&client_id=gateway-service" +
                "&username=$email" +
                "&password=$password"

        val request = HttpEntity(body, headers)

        try {
            val response = restTemplate.postForObject(
                tokenUrl,
                request,
                KeycloakTokenResponse::class.java
            ) ?: throw KeycloakAuthenticationException("Ошибка получения токенов")

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
        val tokenUrl = "$adminServerUrl/realms/master/protocol/openid-connect/token"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
        }

        val body = "grant_type=password" +
                "&client_id=admin-cli" +
                "&username=$adminUsername" +
                "&password=$adminPassword"

        val request = HttpEntity(body, headers)

        val response = restTemplate.postForObject(
            tokenUrl,
            request,
            KeycloakTokenResponse::class.java
        ) ?: throw KeycloakAdminException("Не удалось получить admin token")

        return response.accessToken
    }

    /**
     * Поиск пользователя по email
     */
    private fun findUserByEmail(email: String, token: String): String? {
        val url = "$adminServerUrl/admin/realms/$realm/users?email=$email&exact=true"

        val headers = HttpHeaders().apply {
            set("Authorization", "Bearer $token")
        }

        val request = HttpEntity<String>(headers)

        try {
            val response = restTemplate.exchange(
                url,
                org.springframework.http.HttpMethod.GET,
                request,
                Array<UserRepresentation>::class.java
            )

            return response.body?.firstOrNull()?.id
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
        val url = "$adminServerUrl/admin/realms/$realm/users"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            set("Authorization", "Bearer $token")
        }

        val body = mapOf(
            "username" to email,
            "email" to email,
            "firstName" to name,
            "enabled" to true,
            "emailVerified" to false,
            "attributes" to mapOf(
                "name" to listOf(name),
                "phone" to listOfNotNull(phone)
            )
        )

        val request = HttpEntity(body, headers)

        val response = restTemplate.exchange(
            url,
            org.springframework.http.HttpMethod.POST,
            request,
            Void::class.java
        )

        // Извлекаем ID из Location заголовка
        val location = response.headers.location
            ?: throw KeycloakCreationException("Не удалось получить ID созданного пользователя")

        return location.path.substringAfterLast("/")
    }

    /**
     * Установка пароля пользователю
     */
    private fun setPassword(userId: String, password: String, token: String) {
        val url = "$adminServerUrl/admin/realms/$realm/users/$userId/reset-password"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            set("Authorization", "Bearer $token")
        }

        val body = mapOf(
            "type" to "password",
            "value" to password,
            "temporary" to false
        )

        val request = HttpEntity(body, headers)

        restTemplate.exchange(
            url,
            org.springframework.http.HttpMethod.PUT,
            request,
            Void::class.java
        )
    }
}

// DTO для ответов Keycloak
data class KeycloakTokenResponse(
    val access_token: String,
    val refresh_token: String?,
    val expires_in: Int,
    val scope: String? = null,
    val token_type: String? = null
) {
    val accessToken: String get() = access_token
    val refreshToken: String? get() = refresh_token
    val expiresIn: Int get() = expires_in
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

// Response DTO
data class TokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long
)

// Exceptions
class UserAlreadyExistsException(message: String) : RuntimeException(message)
class KeycloakCreationException(message: String) : RuntimeException(message)
class KeycloakAuthenticationException(message: String) : RuntimeException(message)
class KeycloakAdminException(message: String) : RuntimeException(message)
