package ru.larkin.areaservice.dto.req

import ru.larkin.areaservice.entity.SportsPlaceType

data class SportsPlaceCreateRequest(
    val name: String,
    val description: String? = null,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val placeType: SportsPlaceType = SportsPlaceType.FREE,
    val priceInfo: String? = null,
    val workingHours: String? = null,
    val contactInfo: String? = null,
    val supportedSports: List<String> = emptyList(),
    val imageUrl: String? = null
)
