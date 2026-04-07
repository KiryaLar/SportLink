package ru.larkin.profileservice.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.profileservice.dto.req.ProfileCreateRequest
import ru.larkin.profileservice.dto.req.ProfileUpdateRequest
import ru.larkin.profileservice.dto.resp.ProfileResponse
import ru.larkin.profileservice.dto.resp.ProfileSummaryResponse
import ru.larkin.profileservice.entity.Profile
import ru.larkin.profileservice.entity.ProfileStatus
import ru.larkin.profileservice.entity.SportInfo
import ru.larkin.profileservice.exception.NotFoundException
import ru.larkin.profileservice.exception.ProfileErrorType
import ru.larkin.profileservice.exception.ProfileServiceException
import ru.larkin.profileservice.repository.ProfileRepository
import ru.larkin.profileservice.storage.service.ImageStorageService
import ru.larkin.profileservice.utils.toProfileResponse
import ru.larkin.profileservice.utils.toProfileSummaryResponse
import java.util.UUID

@Transactional
@Service
class ProfileService(
    private val profileRepository: ProfileRepository,
    private val imageStorageService: ImageStorageService,
) {

    private val log = LoggerFactory.getLogger(ProfileService::class.java)

    @Transactional(readOnly = true)
    fun getProfileById(id: Long): ProfileResponse =
        profileRepository.findById(id)
        .orElseThrow { NotFoundException.profileNotFound(id) }
        .toProfileResponse(imageStorageService::buildPublicUrlByKey)

    @Transactional(readOnly = true)
    fun getProfileByUserId(userId: UUID): ProfileResponse {
        val profile = profileRepository.findByKeycloakUserId(userId)
            ?: throw NotFoundException.userNotFound(userId)
        return profile.toProfileResponse(imageStorageService::buildPublicUrlByKey)
    }

    @Transactional(readOnly = true)
    fun getProfileSummaryById(id: Long): ProfileSummaryResponse? =
        profileRepository.findById(id)
        .orElseThrow { NotFoundException.profileNotFound(id) }
        .toProfileSummaryResponse(imageStorageService::buildPublicUrlByKey)

    @Transactional(readOnly = true)
    fun getProfileSummaries(): List<ProfileSummaryResponse> =
        profileRepository.findAllByStatus(ProfileStatus.ACTIVE)
            .map { it.toProfileSummaryResponse(imageStorageService::buildPublicUrlByKey) }

    @Transactional(readOnly = true)
    fun searchProfiles(
        sport: String?,
        city: String?,
        minLevel: Int?,
        maxLevel: Int?
    ): List<ProfileSummaryResponse> {
        return profileRepository.searchProfileSummaries(sport, city, minLevel, maxLevel)
    }

    fun createProfile(userId: UUID, email: String, request: ProfileCreateRequest): ProfileResponse {
        if (profileRepository.existsByKeycloakUserId(userId)) {
            throw ProfileServiceException(
                ProfileErrorType.VALIDATION,
                "Профиль уже существует для пользователя $userId"
            )
        }

        val profile = Profile(
            keycloakUserId = userId,
            email = email,
        )
        profile.name = request.name
        profile.phone = request.phone
        profile.city = request.city
        profile.age = request.age
        profile.description = request.description
        profile.sports = request.sports.map { sportReq ->
            SportInfo(
                profile = profile,
                sport = sportReq.sport,
                level = sportReq.level,
                description = sportReq.description
            )
        }.toMutableList()
        val savedProfile = profileRepository.save(profile)
        return savedProfile.toProfileResponse(imageStorageService::buildPublicUrlByKey)
    }

    fun updateProfile(userId: UUID, request: ProfileUpdateRequest): ProfileResponse {
        val profile = profileRepository.findByKeycloakUserId(userId)
            ?: throw NotFoundException.userNotFound(userId)

        request.name?.let { profile.name = it }
        request.phone?.let { profile.phone = it }
        request.city?.let { profile.city = it }
        request.description?.let { profile.description = it }

        request.sports?.let { sports ->
            profile.sports.clear()
            profile.sports.addAll(sports.map { sportReq ->
                SportInfo(
                    profile = profile,
                    sport = sportReq.sport,
                    level = sportReq.level,
                    description = sportReq.description
                )
            })
        }

        val updatedProfile = profileRepository.save(profile)
        return updatedProfile.toProfileResponse(imageStorageService::buildPublicUrlByKey)
    }

    fun updateRating(profileId: Long, newRating: Double) {
        val profile = profileRepository.findById(profileId)
            .orElseThrow { NotFoundException.profileNotFound(profileId) }

        val totalRating = profile.ratingAvg * profile.ratingCount + newRating
        profile.ratingCount++
        profile.ratingAvg = totalRating / profile.ratingCount
        profile.ratingVersion++

        profileRepository.save(profile)
    }

    /**
     * Создаёт минимальный профиль после регистрации в Keycloak
     */
    fun createMinimalProfile(keycloakUserId: UUID, email: String, name: String): Profile {
        if (profileRepository.existsByKeycloakUserId(keycloakUserId)) {
            log.warn("Profile already exists for user $keycloakUserId")
            return profileRepository.findByKeycloakUserId(keycloakUserId)!!
        }

        val profile = Profile(
            keycloakUserId = keycloakUserId,
            email = email,
        )
        profile.name = name
        profile.status = ProfileStatus.ACTIVE
        profile.sports = mutableListOf()

        return profileRepository.save(profile)
    }

    /**
     * Обновляет email (если пользователь сменил в Keycloak)
     */
    fun updateEmail(keycloakUserId: UUID, newEmail: String) {
        val profile = profileRepository.findByKeycloakUserId(keycloakUserId)
            ?: throw NotFoundException.userNotFound(keycloakUserId)
        
        profile.email = newEmail
        profileRepository.save(profile)
    }

    /**
     * Деактивирует профиль при удалении пользователя
     */
    fun deactivateProfile(keycloakUserId: UUID) {
        val profile = profileRepository.findByKeycloakUserId(keycloakUserId)
            ?: return // Профиля нет — ок
        
        profile.status = ProfileStatus.DEACTIVATED
        profileRepository.save(profile)
    }
}
