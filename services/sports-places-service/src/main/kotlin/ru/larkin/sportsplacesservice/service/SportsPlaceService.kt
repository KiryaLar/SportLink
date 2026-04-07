package ru.larkin.sportsplacesservice.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.sportsplacesservice.dto.req.SportsPlaceCreateRequest
import ru.larkin.sportsplacesservice.dto.req.SportsPlaceSearchRequest
import ru.larkin.sportsplacesservice.dto.req.SportsPlaceUpdateRequest
import ru.larkin.sportsplacesservice.dto.resp.SportsPlaceResponse
import ru.larkin.sportsplacesservice.dto.resp.SportsPlaceSummaryResponse
import ru.larkin.sportsplacesservice.entity.SportsPlaceStatus
import ru.larkin.sportsplacesservice.exception.NotFoundException
import ru.larkin.sportsplacesservice.repository.SportsPlaceRepository
import ru.larkin.sportsplacesservice.util.toEntity
import ru.larkin.sportsplacesservice.util.toResponse
import ru.larkin.sportsplacesservice.util.toSummaryResponse
import java.util.UUID

@Service
class SportsPlaceService(
    private val sportsPlaceRepository: SportsPlaceRepository
) {

    @Transactional(readOnly = true)
    fun getSportsPlaceById(id: Long): SportsPlaceResponse {
        val place = sportsPlaceRepository.findById(id)
            .orElseThrow { NotFoundException.placeNotFound(id) }
        return place.toResponse()
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
        return places.map { it.toSummaryResponse() }
    }

    @Transactional(readOnly = true)
    fun getActiveSportsPlaces(): List<SportsPlaceSummaryResponse> {
        return sportsPlaceRepository.findByStatus(SportsPlaceStatus.ACTIVE)
            .map { it.toSummaryResponse() }
    }

    @Transactional
    fun createSportsPlace(userId: UUID, request: SportsPlaceCreateRequest): SportsPlaceResponse {
        val place = request.toEntity(
            createdBy = userId,
            status = SportsPlaceStatus.PENDING // Требует модерации
        )

        val savedPlace = sportsPlaceRepository.save(place)
        return savedPlace.toResponse()
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
        return updatedPlace.toResponse()
    }

    @Transactional
    fun updateSportsPlaceStatus(id: Long, status: SportsPlaceStatus): SportsPlaceResponse {
        val place = sportsPlaceRepository.findById(id)
            .orElseThrow { NotFoundException.placeNotFound(id) }

        place.status = status
        val updatedPlace = sportsPlaceRepository.save(place)
        return updatedPlace.toResponse()
    }

    @Transactional
    fun deleteSportsPlace(id: Long) {
        if (!sportsPlaceRepository.existsById(id)) {
            throw NotFoundException.placeNotFound(id)
        }
        sportsPlaceRepository.deleteById(id)
    }
}
