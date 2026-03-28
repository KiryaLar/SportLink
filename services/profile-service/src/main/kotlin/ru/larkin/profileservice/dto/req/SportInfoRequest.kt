package ru.larkin.profileservice.dto.req

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import ru.larkin.profileservice.entity.Sport

data class SportInfoRequest(
    val sport: Sport,

    @field:Min(value = 1, message = "Уровень должен быть от 1")
    @field:Max(value = 10, message = "Уровень должен быть до 10")
    val level: Int,

    @field:Size(max = 500, message = "Описание навыка не должно превышать 500 символов")
    val description: String? = null
)