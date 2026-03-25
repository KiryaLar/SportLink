package ru.larkin.gatewayservice.exception

class KeycloakAuthenticationException(
    message: String,
    cause: Throwable? = null
) : GatewayException(message, cause)

