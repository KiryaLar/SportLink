package ru.larkin.areaservice.dto.req

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size

data class SportsPlaceSearchRequest(
    @field:Size(max = 100, message = "sport не должен превышать 100 символов")
    val sport: String? = null,

    @field:Min(value = -90, message = "Широта должна быть в диапазоне [-90; 90]")
    @field:Max(value = 90, message = "Широта должна быть в диапазоне [-90; 90]")
    val latitude: Double? = null,

    @field:Min(value = -180, message = "Долгота должна быть в диапазоне [-180; 180]")
    @field:Max(value = 180, message = "Долгота должна быть в диапазоне [-180; 180]")
    val longitude: Double? = null,

    @field:Positive(message = "radiusKm должен быть положительным")
    val radiusKm: Double? = null,

    val placeType: ru.larkin.areaservice.entity.SportsPlaceType? = null,
    val status: ru.larkin.areaservice.entity.SportsPlaceStatus? = null
)
