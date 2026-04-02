package ru.larkin.sportsplacesservice.service

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.sportsplacesservice.dto.req.SportsPlaceCreateRequest
import ru.larkin.sportsplacesservice.dto.resp.SportsPlaceResponse
import ru.larkin.sportsplacesservice.entity.SportsPlaceStatus
import ru.larkin.sportsplacesservice.entity.SportsPlaceType
import ru.larkin.sportsplacesservice.repository.SportsPlaceRepository
import ru.larkin.sportsplacesservice.util.toEntity
import ru.larkin.sportsplacesservice.util.toResponse

@Service
@ConditionalOnProperty(name = ["seed.data.enabled"], havingValue = "true", matchIfMissing = true)
class SportsPlaceSeedService(
    private val sportsPlaceRepository: SportsPlaceRepository,
    private val objectMapper: ObjectMapper
) {

    private val log = LoggerFactory.getLogger(SportsPlaceSeedService::class.java)

    @PostConstruct
    @Transactional
    fun loadSeedData() {
        val resource = ClassPathResource("seed/sports-places.json")
        if (!resource.exists()) {
            log.warn("Seed file not found")
            return
        }

        try {
            resource.inputStream.use { inputStream ->
                val places: List<Map<String, Any?>> = objectMapper.readValue(
                    inputStream,
                    object : TypeReference<List<Map<String, Any?>>>() {}
                )

                var addedCount = 0
                places.forEach { placeData ->
                    try {
                        val request = SportsPlaceCreateRequest(
                            name = placeData["name"] as String,
                            address = placeData["address"] as String,
                            latitude = (placeData["latitude"] as Number).toDouble(),
                            longitude = (placeData["longitude"] as Number).toDouble(),
                            placeType = SportsPlaceType.valueOf(placeData["placeType"] as String),
                            supportedSports = (placeData["supportedSports"] as List<*>).map { it as String },
                            priceInfo = placeData["priceInfo"] as String?,
                            description = placeData["description"] as String?
                        )
                        createPlaceForSeedData(request)
                        addedCount++
                    } catch (e: Exception) {
                        log.warn("Failed to add place {}: {}", placeData["name"], e.message)
                    }
                }

                log.info("Loaded $addedCount sports places from seed data")
            }
        } catch (e: Exception) {
            log.error("Error loading seed data", e)
        }
    }

    fun createPlaceForSeedData(request: SportsPlaceCreateRequest): SportsPlaceResponse {
        val place = request.toEntity(
            createdBy = null,
            status = SportsPlaceStatus.ACTIVE // Для seed данных сразу активны
        )

        val savedPlace = sportsPlaceRepository.save(place)
        return savedPlace.toResponse()
    }
}
