package ru.larkin.gatewayservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.larkin.gatewayservice.service.KeycloakAdminService
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val keycloakAdminService: KeycloakAdminService
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<RegisterResponse> {
        val userId = keycloakAdminService.createUser(
            email = request.email,
            password = request.password,
            name = request.name,
            phone = request.phone
        )
        return ResponseEntity.ok(RegisterResponse(userId, message = "Пользователь успешно зарегистрирован. Профиль будет создан автоматически."))
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val tokens = keycloakAdminService.login(request.email, request.password)
        return ResponseEntity.ok(LoginResponse(
            accessToken = tokens.accessToken,
            refreshToken = tokens.refreshToken,
            expiresIn = tokens.expiresIn
        ))
    }
}

data class RegisterRequest(
    @field:NotBlank(message = "Email не может быть пустым")
    @field:Email(message = "Некорректный email")
    val email: String,

    @field:NotBlank(message = "Пароль не может быть пустым")
    @field:Size(min = 8, message = "Пароль должен содержать минимум 8 символов")
    val password: String,

    @field:NotBlank(message = "Имя не может быть пустым")
    val name: String,

    val phone: String? = null
)

data class RegisterResponse(
    val userId: String,
    val message: String
)

data class LoginRequest(
    @field:NotBlank(message = "Email не может быть пустым")
    @field:Email(message = "Некорректный email")
    val email: String,

    @field:NotBlank(message = "Пароль не может быть пустым")
    val password: String
)

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long
)
