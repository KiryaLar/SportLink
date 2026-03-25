package ru.larkin.gatewayservice.dto.req

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank(message = "Email не может быть пустым")
    @field:Email(message = "Некорректный email")
    val email: String,

    @field:NotBlank(message = "Пароль не может быть пустым")
    @field:Size(min = 8, message = "Пароль должен содержать минимум 8 символов")
    val password: String,

    @field:NotBlank(message = "Имя не может быть пустым")
    val name: String,

    val phone: String? = null
)
