package ru.larkin.matchesservice.dto.req

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import ru.larkin.matchesservice.entity.MatchStatus

data class MatchSearchRequest(
    @field:Size(max = 100, message = "Вид спорта не должен превышать 100 символов")
    val sport: String? = null,

    @field:Size(max = 100, message = "Город не должен превышать 100 символов")
    val city: String? = null,

    val dateFrom: java.time.Instant? = null,
    val dateTo: java.time.Instant? = null,

    @field:Min(value = -90, message = "Широта должна быть в диапазоне [-90; 90]")
    @field:Max(value = 90, message = "Широта должна быть в диапазоне [-90; 90]")
    val latitude: Double? = null,

    @field:Min(value = -180, message = "Долгота должна быть в диапазоне [-180; 180]")
    @field:Max(value = 180, message = "Долгота должна быть в диапазоне [-180; 180]")
    val longitude: Double? = null,

    @field:Positive(message = "radiusKm должен быть положительным")
    val radiusKm: Double? = null,

    @field:Min(value = 1, message = "minLevel должен быть от 1")
    @field:Max(value = 10, message = "minLevel должен быть до 10")
    val minLevel: Int? = null,

    @field:Min(value = 1, message = "maxLevel должен быть от 1")
    @field:Max(value = 10, message = "maxLevel должен быть до 10")
    val maxLevel: Int? = null,

    val status: MatchStatus? = null
)
