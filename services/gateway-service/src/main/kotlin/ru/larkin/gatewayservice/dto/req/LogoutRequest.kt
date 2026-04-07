package ru.larkin.gatewayservice.dto.req

import jakarta.validation.constraints.NotBlank

data class LogoutRequest(
    @field:NotBlank
    val refreshToken: String
)
