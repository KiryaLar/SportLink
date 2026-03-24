package ru.larkin.areaservice.dto.req

data class SportsPlaceSearchRequest(
    val sport: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val radiusKm: Double? = null,
    val placeType: ru.larkin.areaservice.entity.SportsPlaceType? = null,
    val status: ru.larkin.areaservice.entity.SportsPlaceStatus? = null
)
