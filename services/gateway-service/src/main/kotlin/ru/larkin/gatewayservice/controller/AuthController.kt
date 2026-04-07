package ru.larkin.gatewayservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.larkin.gatewayservice.service.KeycloakAdminService
import jakarta.validation.Valid
import ru.larkin.gatewayservice.dto.req.LoginRequest
import ru.larkin.gatewayservice.dto.req.LogoutRequest
import ru.larkin.gatewayservice.dto.req.RefreshRequest
import ru.larkin.gatewayservice.dto.req.RegisterRequest
import ru.larkin.gatewayservice.dto.resp.LoginResponse

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val keycloakAdminService: KeycloakAdminService
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<LoginResponse> {
        keycloakAdminService.createUser(
            email = request.email,
            password = request.password,
            name = request.name,
            phone = request.phone
        )

        val tokens = keycloakAdminService.login(request.email, request.password)
        return ResponseEntity.ok(LoginResponse(
            accessToken = tokens.accessToken,
            refreshToken = tokens.refreshToken,
            expiresIn = tokens.expiresIn
        ))
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

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshRequest): ResponseEntity<LoginResponse> {
        val tokens = keycloakAdminService.refreshToken(request.refreshToken)
        return ResponseEntity.ok(LoginResponse(
            accessToken = tokens.accessToken,
            refreshToken = tokens.refreshToken,
            expiresIn = tokens.expiresIn
        ))
    }

    @PostMapping("/logout")
    fun logout(@Valid @RequestBody request: LogoutRequest): ResponseEntity<Void> {
        keycloakAdminService.revokeToken(request.refreshToken)
        return ResponseEntity.noContent().build()
    }
}
