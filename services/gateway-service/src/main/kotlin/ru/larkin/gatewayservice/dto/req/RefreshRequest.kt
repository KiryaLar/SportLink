package ru.larkin.gatewayservice.dto.req

import jakarta.validation.constraints.NotBlank

data class RefreshRequest(
    @field:NotBlank
    val refreshToken: String
)
