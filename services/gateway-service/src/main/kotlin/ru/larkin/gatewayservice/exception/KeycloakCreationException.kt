package ru.larkin.gatewayservice.exception

class KeycloakCreationException(
    message: String,
    cause: Throwable? = null
) : GatewayException(message, cause)

