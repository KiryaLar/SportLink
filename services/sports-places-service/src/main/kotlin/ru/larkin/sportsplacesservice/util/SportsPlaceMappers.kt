package ru.larkin.sportsplacesservice.util

import ru.larkin.sportsplacesservice.dto.req.SportsPlaceCreateRequest
import ru.larkin.sportsplacesservice.dto.resp.SportsPlaceResponse
import ru.larkin.sportsplacesservice.dto.resp.SportsPlaceSummaryResponse
import ru.larkin.sportsplacesservice.entity.SportsPlace
import ru.larkin.sportsplacesservice.entity.SportsPlaceStatus
import java.util.UUID

fun SportsPlace.toResponse(): SportsPlaceResponse = SportsPlaceResponse(
    id = requireNotNull(id) { "SportsPlace.id is null" },
    name = name,
    description = description,
    address = address,
    latitude = latitude,
    longitude = longitude,
    placeType = placeType,
    status = status,
    priceInfo = priceInfo,
    workingHours = workingHours,
    contactInfo = contactInfo,
    supportedSports = supportedSports.toList(),
    imageUrl = imageUrl,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun SportsPlace.toSummaryResponse(): SportsPlaceSummaryResponse = SportsPlaceSummaryResponse(
    id = requireNotNull(id) { "SportsPlace.id is null" },
    name = name,
    address = address,
    latitude = latitude,
    longitude = longitude,
    placeType = placeType,
    status = status,
    supportedSports = supportedSports.toList(),
    imageUrl = imageUrl
)

fun SportsPlaceCreateRequest.toEntity(
    createdBy: UUID?,
    status: SportsPlaceStatus
): SportsPlace = SportsPlace(
    name = name,
    description = description,
    address = address,
    latitude = latitude,
    longitude = longitude,
    placeType = placeType,
    status = status,
    priceInfo = priceInfo,
    workingHours = workingHours,
    contactInfo = contactInfo,
    supportedSports = supportedSports.toMutableList(),
    imageUrl = imageUrl,
    createdBy = createdBy
)
