package ru.larkin.gatewayservice.exception

/**
 * Базовое исключение gateway-service для всех доменных/инфраструктурных ошибок.
 */
open class GatewayException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)

