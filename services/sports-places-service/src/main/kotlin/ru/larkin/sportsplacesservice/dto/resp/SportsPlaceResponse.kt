package ru.larkin.sportsplacesservice.dto.resp

import ru.larkin.sportsplacesservice.entity.SportsPlaceStatus
import ru.larkin.sportsplacesservice.entity.SportsPlaceType
import java.time.Instant

data class SportsPlaceResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val placeType: SportsPlaceType,
    val status: SportsPlaceStatus,
    val priceInfo: String?,
    val workingHours: String?,
    val contactInfo: String?,
    val supportedSports: List<String>,
    val imageUrl: String?,
    val createdAt: Instant,
    val updatedAt: Instant
)
