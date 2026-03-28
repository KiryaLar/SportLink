package ru.larkin.profileservice.dto.req

import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size

data class ProfileCreateRequest(
    @field:NotBlank(message = "Имя не может быть пустым")
    @field:Size(max = 100, message = "Имя не должно превышать 100 символов")
    val name: String,

    @field:NotBlank(message = "Email не может быть пустым")
    @field:Email(message = "Некорректный email")
    val email: String,

    @field:NotBlank(message = "Телефон не может быть пустым")
    @field:Size(max = 32, message = "Телефон не должен превышать 32 символа")
    val phone: String,

    @field:NotBlank(message = "Город не может быть пустым")
    @field:Size(max = 100, message = "Город не должен превышать 100 символов")
    val city: String,

    @field:Min(value = 1, message = "Возраст должен быть больше 0")
    @field:Max(value = 120, message = "Возраст должен быть не больше 120")
    val age: Int,

    @field:Size(max = 2000, message = "Описание не должно превышать 2000 символов")
    val description: String? = null,

    @field:Valid
    @field:NotEmpty(message = "Список видов спорта не может быть пустым")
    val sports: List<SportInfoRequest> = emptyList()
)