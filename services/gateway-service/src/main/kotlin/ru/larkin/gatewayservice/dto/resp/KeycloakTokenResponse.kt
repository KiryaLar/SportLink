package ru.larkin.gatewayservice.dto.resp

import com.fasterxml.jackson.annotation.JsonProperty

// DTO для ответов Keycloak
data class KeycloakTokenResponse(
    @JsonProperty("access_token")
    val accessToken: String,
    @JsonProperty("refresh_token")
    val refreshToken: String?,
    @JsonProperty("expires_in")
    val expiresIn: Int,
    val scope: String? = null,
    @JsonProperty("token_type")
    val tokenType: String? = null
)
