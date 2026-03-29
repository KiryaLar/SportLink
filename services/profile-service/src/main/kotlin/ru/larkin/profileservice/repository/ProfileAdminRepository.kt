package ru.larkin.profileservice.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import ru.larkin.profileservice.entity.Profile
import ru.larkin.profileservice.entity.ProfileStatus
import java.util.UUID

@Repository
interface ProfileAdminRepository : JpaRepository<Profile, Long> {

    fun countByStatus(status: ProfileStatus): Long

    @Query("SELECT COUNT(p) FROM Profile p WHERE p.status = 'ACTIVE'")
    fun countActiveUsers(): Long

    @Query("SELECT COUNT(p) FROM Profile p WHERE p.status = 'BLOCKED'")
    fun countBlockedUsers(): Long

    @Query("SELECT COUNT(p) FROM Profile p WHERE p.status = 'BANNED'")
    fun countBannedUsers(): Long

    fun findAll(pageable: Pageable): Page<Profile>
}
