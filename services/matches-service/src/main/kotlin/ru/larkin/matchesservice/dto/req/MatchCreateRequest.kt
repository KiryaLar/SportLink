package ru.larkin.matchesservice.dto.req

import jakarta.validation.constraints.*
import java.time.Instant

data class MatchCreateRequest(
    @field:NotBlank(message = "Название не может быть пустым")
    @field:Size(max = 200, message = "Название не должно превышать 200 символов")
    val title: String,

    @field:NotBlank(message = "Вид спорта не может быть пустым")
    @field:Size(max = 100, message = "Вид спорта не должен превышать 100 символов")
    val sport: String,

    @field:NotNull(message = "scheduledAt обязателен")
    val scheduledAt: Instant,

    @field:NotNull(message = "sportsPlaceId обязателен")
    var sportsPlaceId: Long,

//    @field:NotBlank(message = "Локация не может быть пустой")
//    @field:Size(max = 255, message = "Локация не должна превышать 255 символов")
//    val locationName: String,
//
//    @field:Min(value = -90, message = "Широта должна быть в диапазоне [-90; 90]")
//    @field:Max(value = 90, message = "Широта должна быть в диапазоне [-90; 90]")
//    val latitude: Double,
//
//    @field:Min(value = -180, message = "Долгота должна быть в диапазоне [-180; 180]")
//    @field:Max(value = 180, message = "Долгота должна быть в диапазоне [-180; 180]")
//    val longitude: Double,

    @field:Positive(message = "maxParticipants должен быть положительным")
    val maxParticipants: Int,

    @field:Min(value = 1, message = "minLevel должен быть от 1")
    @field:Max(value = 10, message = "minLevel должен быть до 10")
    val minLevel: Int = 1,

    @field:Min(value = 1, message = "maxLevel должен быть от 1")
    @field:Max(value = 10, message = "maxLevel должен быть до 10")
    val maxLevel: Int = 10,

    @field:Size(max = 5000, message = "Описание не должно превышать 5000 символов")
    val description: String? = null
)
