package ru.larkin.areaservice.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.areaservice.dto.req.SportsPlaceCreateRequest
import ru.larkin.areaservice.dto.req.SportsPlaceSearchRequest
import ru.larkin.areaservice.dto.req.SportsPlaceUpdateRequest
import ru.larkin.areaservice.dto.resp.SportsPlaceResponse
import ru.larkin.areaservice.dto.resp.SportsPlaceSummaryResponse
import ru.larkin.areaservice.entity.SportsPlace
import ru.larkin.areaservice.entity.SportsPlaceStatus
import ru.larkin.areaservice.exception.NotFoundException
import ru.larkin.areaservice.repository.SportsPlaceRepository
import java.util.UUID

@Service
class SportsPlaceService(
    private val sportsPlaceRepository: SportsPlaceRepository
) {

    @Transactional(readOnly = true)
    fun getSportsPlaceById(id: Long): SportsPlaceResponse {
        val place = sportsPlaceRepository.findById(id)
            .orElseThrow { NotFoundException.placeNotFound(id) }
        return place.toSportsPlaceResponse()
    }

    @Transactional(readOnly = true)
    fun getAllSportsPlaces(): List<SportsPlaceSummaryResponse> {
        return sportsPlaceRepository.findAll()
            .filter { it.status == SportsPlaceStatus.ACTIVE }
            .map { it.toSportsPlaceSummaryResponse() }
    }

    @Transactional(readOnly = true)
    fun searchSportsPlaces(request: SportsPlaceSearchRequest): List<SportsPlaceSummaryResponse> {
        val places = sportsPlaceRepository.searchSportsPlaces(
            request.sport,
            request.status,
            request.placeType,
            request.latitude,
            request.longitude,
            request.radiusKm
        )
        return places.map { it.toSportsPlaceSummaryResponse() }
    }

    @Transactional(readOnly = true)
    fun getActiveSportsPlaces(): List<SportsPlaceSummaryResponse> {
        return sportsPlaceRepository.findByStatus(SportsPlaceStatus.ACTIVE)
            .map { it.toSportsPlaceSummaryResponse() }
    }

    @Transactional
    fun createPlace(request: SportsPlaceCreateRequest): SportsPlaceResponse {
        val place = SportsPlace(
            name = request.name,
            description = request.description,
            address = request.address,
            latitude = request.latitude,
            longitude = request.longitude,
            placeType = request.placeType,
            priceInfo = request.priceInfo,
            workingHours = request.workingHours,
            contactInfo = request.contactInfo,
            supportedSports = request.supportedSports.toMutableList(),
            imageUrl = request.imageUrl,
            status = SportsPlaceStatus.ACTIVE // Для seed данных сразу активны
        )

        val savedPlace = sportsPlaceRepository.save(place)
        return savedPlace.toSportsPlaceResponse()
    }

    @Transactional
    fun createSportsPlace(userId: UUID, request: SportsPlaceCreateRequest): SportsPlaceResponse {
        val place = SportsPlace(
            name = request.name,
            description = request.description,
            address = request.address,
            latitude = request.latitude,
            longitude = request.longitude,
            placeType = request.placeType,
            priceInfo = request.priceInfo,
            workingHours = request.workingHours,
            contactInfo = request.contactInfo,
            supportedSports = request.supportedSports.toMutableList(),
            imageUrl = request.imageUrl,
            createdBy = userId,
            status = SportsPlaceStatus.PENDING // Требует модерации
        )

        val savedPlace = sportsPlaceRepository.save(place)
        return savedPlace.toSportsPlaceResponse()
    }

    @Transactional
    fun updateSportsPlace(id: Long, request: SportsPlaceUpdateRequest): SportsPlaceResponse {
        val place = sportsPlaceRepository.findById(id)
            .orElseThrow { NotFoundException.placeNotFound(id) }

        request.name?.let { place.name = it }
        request.description?.let { place.description = it }
        request.address?.let { place.address = it }
        request.latitude?.let { place.latitude = it }
        request.longitude?.let { place.longitude = it }
        request.placeType?.let { place.placeType = it }
        request.priceInfo?.let { place.priceInfo = it }
        request.workingHours?.let { place.workingHours = it }
        request.contactInfo?.let { place.contactInfo = it }
        request.supportedSports?.let { place.supportedSports = it.toMutableList() }
        request.imageUrl?.let { place.imageUrl = it }

        val updatedPlace = sportsPlaceRepository.save(place)
        return updatedPlace.toSportsPlaceResponse()
    }

    @Transactional
    fun updateSportsPlaceStatus(id: Long, status: SportsPlaceStatus): SportsPlaceResponse {
        val place = sportsPlaceRepository.findById(id)
            .orElseThrow { NotFoundException.placeNotFound(id) }

        place.status = status
        val updatedPlace = sportsPlaceRepository.save(place)
        return updatedPlace.toSportsPlaceResponse()
    }

    @Transactional
    fun deleteSportsPlace(id: Long) {
        if (!sportsPlaceRepository.existsById(id)) {
            throw NotFoundException.placeNotFound(id)
        }
        sportsPlaceRepository.deleteById(id)
    }
}

private fun SportsPlace.toSportsPlaceResponse(): SportsPlaceResponse {
    return SportsPlaceResponse(
        id = id!!,
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
}

private fun SportsPlace.toSportsPlaceSummaryResponse(): SportsPlaceSummaryResponse {
    return SportsPlaceSummaryResponse(
        id = id!!,
        name = name,
        address = address,
        latitude = latitude,
        longitude = longitude,
        placeType = placeType,
        status = status,
        supportedSports = supportedSports.toList(),
        imageUrl = imageUrl
    )
}
