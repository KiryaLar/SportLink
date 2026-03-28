package ru.larkin.gatewayservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.larkin.gatewayservice.service.KeycloakAdminService
import jakarta.validation.Valid
import ru.larkin.gatewayservice.dto.req.LoginRequest
import ru.larkin.gatewayservice.dto.req.RegisterRequest
import ru.larkin.gatewayservice.dto.resp.LoginResponse
import ru.larkin.gatewayservice.dto.resp.RegisterResponse

@RestController
@RequestMapping("/api/v1/auth/")
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