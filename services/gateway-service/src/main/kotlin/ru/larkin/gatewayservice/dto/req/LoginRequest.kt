package ru.larkin.gatewayservice.dto.req

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequest(
    @field:NotBlank(message = "Email не может быть пустым")
    @field:Email(message = "Некорректный email")
    val email: String,

    @field:NotBlank(message = "Пароль не может быть пустым")
    val password: String
)