package ru.larkin.profileservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.profileservice.dto.resp.ProfileSummaryResponse
import ru.larkin.profileservice.entity.Profile
import ru.larkin.profileservice.entity.ProfileStatus
import java.util.UUID

interface ProfileRepository : JpaRepository<Profile, Long> {

    fun findByKeycloakUserId(keycloakUserId: UUID): Profile?

    fun existsByKeycloakUserId(keycloakUserId: UUID): Boolean

    fun findAllByStatus(status: ProfileStatus): List<Profile>

    @Query(
        """
        SELECT DISTINCT p FROM Profile p
        LEFT JOIN p.sports s
        WHERE p.status = :status
        AND (:sport IS NULL OR s.sport = :sport)
        AND (:city IS NULL OR p.city = :city)
        AND (:minLevel IS NULL OR s.level >= :minLevel)
        AND (:maxLevel IS NULL OR s.level <= :maxLevel)
        """
    )
    fun searchProfiles(
        @Param("sport") sport: String?,
        @Param("city") city: String?,
        @Param("minLevel") minLevel: Int?,
        @Param("maxLevel") maxLevel: Int?,
        @Param("status") status: ProfileStatus = ProfileStatus.ACTIVE
    ): List<Profile>

    @Query(
        """
        SELECT new ru.larkin.profileservice.dto.resp.ProfileSummaryResponse(
            p.id,
            p.name,
            p.city,
            p.avatarKey
        )
        FROM Profile p
        WHERE p.status = :status
        AND (:city IS NULL OR p.city = :city)
        AND (
            (:sport IS NULL AND (
                (:minLevel IS NULL AND :maxLevel IS NULL)
                OR EXISTS (
                    SELECT 1
                    FROM p.sports s
                    WHERE (:minLevel IS NULL OR s.level >= :minLevel)
                    AND (:maxLevel IS NULL OR s.level <= :maxLevel)
                )
            ))
            OR
            (:sport IS NOT NULL AND EXISTS (
                SELECT 1
                FROM p.sports s
                WHERE s.sport = :sport
                AND (:minLevel IS NULL OR s.level >= :minLevel)
                AND (:maxLevel IS NULL OR s.level <= :maxLevel)
            ))
        )
        AND (:sport IS NULL OR EXISTS (SELECT 1 FROM p.sports s WHERE s.sport = :sport))
        AND (:minLevel IS NULL OR EXISTS (SELECT 1 FROM p.sports s WHERE s.level >= :minLevel))
        AND (:maxLevel IS NULL OR EXISTS (SELECT 1 FROM p.sports s WHERE s.level <= :maxLevel))
        """
    )
    fun searchProfileSummaries(
        @Param("sport") sport: String?,
        @Param("city") city: String?,
        @Param("minLevel") minLevel: Int?,
        @Param("maxLevel") maxLevel: Int?,
        @Param("status") status: ProfileStatus = ProfileStatus.ACTIVE
    ): List<ProfileSummaryResponse>
}
