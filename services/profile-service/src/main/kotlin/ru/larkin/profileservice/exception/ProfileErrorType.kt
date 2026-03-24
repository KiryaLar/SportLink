package ru.larkin.profileservice.exception

import org.springframework.http.HttpStatus

/**
 * Тип (категория) ошибки для кастомных исключений project-service.
 */
enum class ProfileErrorType(val httpStatus: HttpStatus,
                            val detail: String
) {
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    IMAGE_STORAGE(HttpStatus.INTERNAL_SERVER_ERROR, "Image storage error"),
    VALIDATION(HttpStatus.BAD_REQUEST, "Validation failed"),
    INTERNAL(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
}

