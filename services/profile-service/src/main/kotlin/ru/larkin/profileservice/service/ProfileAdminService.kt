package ru.larkin.profileservice.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.profileservice.entity.ProfileStatus
import ru.larkin.profileservice.repository.ProfileAdminRepository

@Service
class ProfileAdminService(
    private val profileAdminRepository: ProfileAdminRepository
) {

    @Transactional(readOnly = true)
    fun getAllProfiles(pageable: Pageable): Page<ru.larkin.profileservice.entity.Profile> {
        return profileAdminRepository.findAll(pageable)
    }

    @Transactional
    fun blockProfile(profileId: Long) {
        val profile = profileAdminRepository.findById(profileId)
            .orElseThrow { throw IllegalArgumentException("Profile not found: $profileId") }
        profile.status = ProfileStatus.BLOCKED
        profileAdminRepository.save(profile)
    }

    @Transactional
    fun unblockProfile(profileId: Long) {
        val profile = profileAdminRepository.findById(profileId)
            .orElseThrow { throw IllegalArgumentException("Profile not found: $profileId") }
        profile.status = ProfileStatus.ACTIVE
        profileAdminRepository.save(profile)
    }

    @Transactional
    fun deleteProfile(profileId: Long) {
        if (!profileAdminRepository.existsById(profileId)) {
            throw IllegalArgumentException("Profile not found: $profileId")
        }
        profileAdminRepository.deleteById(profileId)
    }

    @Transactional(readOnly = true)
    fun getStatistics(): Map<String, Long> {
        val totalUsers = profileAdminRepository.count()
        val activeUsers = profileAdminRepository.countActiveUsers()
        val blockedUsers = profileAdminRepository.countBlockedUsers()
        val bannedUsers = profileAdminRepository.countBannedUsers()
        
        return mapOf(
            "totalUsers" to totalUsers,
            "activeUsers" to activeUsers,
            "blockedUsers" to blockedUsers,
            "bannedUsers" to bannedUsers
        )
    }
}
