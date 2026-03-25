package ru.larkin.gatewayservice.exception

class KeycloakAdminException(
    message: String,
    cause: Throwable? = null
) : GatewayException(message, cause)

