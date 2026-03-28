package ru.larkin.profileservice.dto.req

import jakarta.validation.Valid
import jakarta.validation.constraints.Size
import ru.larkin.profileservice.entity.Sport

data class ProfileUpdateRequest(
    @field:Size(max = 100, message = "Имя не должно превышать 100 символов")
    val name: String? = null,

    @field:Size(max = 32, message = "Телефон не должен превышать 32 символа")
    val phone: String? = null,

    @field:Size(max = 100, message = "Город не должен превышать 100 символов")
    val city: String? = null,

    @field:Size(max = 2000, message = "Описание не должно превышать 2000 символов")
    val description: String? = null,

    @field:Valid
    val sports: List<SportInfoRequest>? = null
)
