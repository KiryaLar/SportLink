package ru.larkin.gatewayservice.dto.resp

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long
)
