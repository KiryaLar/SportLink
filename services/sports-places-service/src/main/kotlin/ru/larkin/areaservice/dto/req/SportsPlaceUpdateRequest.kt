package ru.larkin.areaservice.dto.req

import ru.larkin.areaservice.entity.SportsPlaceType

data class SportsPlaceUpdateRequest(
    val name: String? = null,
    val description: String? = null,
    val address: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val placeType: SportsPlaceType? = null,
    val priceInfo: String? = null,
    val workingHours: String? = null,
    val contactInfo: String? = null,
    val supportedSports: List<String>? = null,
    val imageUrl: String? = null
)
