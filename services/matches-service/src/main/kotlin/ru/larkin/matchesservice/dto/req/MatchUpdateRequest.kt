package ru.larkin.matchesservice.dto.req

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class MatchUpdateRequest(
    @field:Size(max = 200, message = "Название не должно превышать 200 символов")
    val title: String? = null,

    val scheduledAt: java.time.Instant? = null,

    @field:NotNull(message = "sportsPlaceId обязателен")
    var sportsPlaceId: Long,

    @field:Positive(message = "maxParticipants должен быть положительным")
    val maxParticipants: Int? = null,

    @field:Min(value = 1, message = "minLevel должен быть от 1")
    @field:Max(value = 10, message = "minLevel должен быть до 10")
    val minLevel: Int? = null,

    @field:Min(value = 1, message = "maxLevel должен быть от 1")
    @field:Max(value = 10, message = "maxLevel должен быть до 10")
    val maxLevel: Int? = null,

    @field:Size(max = 5000, message = "Описание не должно превышать 5000 символов")
    val description: String? = null
)
