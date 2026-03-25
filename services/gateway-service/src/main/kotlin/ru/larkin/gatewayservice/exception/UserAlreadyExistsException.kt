package ru.larkin.gatewayservice.exception

class UserAlreadyExistsException(
    message: String,
    cause: Throwable? = null
) : GatewayException(message, cause)

