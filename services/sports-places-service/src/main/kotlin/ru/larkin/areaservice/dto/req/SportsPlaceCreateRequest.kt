package ru.larkin.areaservice.dto.req

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import ru.larkin.areaservice.entity.SportsPlaceType

data class SportsPlaceCreateRequest(
    @field:NotBlank(message = "Название не может быть пустым")
    @field:Size(max = 200, message = "Название не должно превышать 200 символов")
    val name: String,

    @field:Size(max = 5000, message = "Описание не должно превышать 5000 символов")
    val description: String? = null,

    @field:NotBlank(message = "Адрес не может быть пустым")
    @field:Size(max = 255, message = "Адрес не должен превышать 255 символов")
    val address: String,

    @field:Min(value = -90, message = "Широта должна быть в диапазоне [-90; 90]")
    @field:Max(value = 90, message = "Широта должна быть в диапазоне [-90; 90]")
    val latitude: Double,

    @field:Min(value = -180, message = "Долгота должна быть в диапазоне [-180; 180]")
    @field:Max(value = 180, message = "Долгота должна быть в диапазоне [-180; 180]")
    val longitude: Double,

    val placeType: SportsPlaceType = SportsPlaceType.FREE,

    @field:Size(max = 500, message = "priceInfo не должен превышать 500 символов")
    val priceInfo: String? = null,

    @field:Size(max = 500, message = "workingHours не должен превышать 500 символов")
    val workingHours: String? = null,

    @field:Size(max = 500, message = "contactInfo не должен превышать 500 символов")
    val contactInfo: String? = null,

    val supportedSports: List<String> = emptyList(),

    @field:Size(max = 2048, message = "imageUrl не должен превышать 2048 символов")
    val imageUrl: String? = null
)
