package ru.larkin.areaservice.dto.resp

import ru.larkin.areaservice.entity.SportsPlaceStatus
import ru.larkin.areaservice.entity.SportsPlaceType

data class SportsPlaceSummaryResponse(
    val id: Long,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val placeType: SportsPlaceType,
    val status: SportsPlaceStatus,
    val supportedSports: List<String>,
    val imageUrl: String?
)
