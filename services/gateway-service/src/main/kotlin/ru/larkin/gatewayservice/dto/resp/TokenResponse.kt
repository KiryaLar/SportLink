package ru.larkin.gatewayservice.dto.resp

data class TokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long
)