package ru.larkin.matchesservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.matchesservice.entity.Match
import ru.larkin.matchesservice.entity.MatchStatus
import java.time.Instant

interface MatchRepository : JpaRepository<Match, Long> {

    fun findByOrganizerId(organizerId: String): List<Match>

    fun findByStatus(status: MatchStatus): List<Match>

    fun findByOrganizerIdAndStatus(organizerId: String, status: MatchStatus): List<Match>

    @Query(
        """
        SELECT m FROM Match m
        WHERE m.status = :status
        AND (:sport IS NULL OR m.sport = :sport)
        AND (:scheduledAtFrom IS NULL OR m.scheduledAt >= :scheduledAtFrom)
        AND (:scheduledAtTo IS NULL OR m.scheduledAt <= :scheduledAtTo)
        AND (:minLevel IS NULL OR m.minLevel <= :minLevel)
        AND (:maxLevel IS NULL OR m.maxLevel >= :maxLevel)
        ORDER BY m.scheduledAt ASC
        """
    )
    fun searchMatches(
        @Param("sport") sport: String?,
        @Param("status") status: MatchStatus?,
        @Param("scheduledAtFrom") scheduledAtFrom: Instant?,
        @Param("scheduledAtTo") scheduledAtTo: Instant?,
        @Param("minLevel") minLevel: Int?,
        @Param("maxLevel") maxLevel: Int?
    ): List<Match>

    @Query(
        """
        SELECT m FROM Match m
        WHERE m.status = :status
        AND (:sport IS NULL OR m.sport = :sport)
        ORDER BY m.scheduledAt ASC
        """
    )
    fun searchMatchesByLocation(
        @Param("sport") sport: String?,
        @Param("status") status: MatchStatus?,
    ): List<Match>

//    @Query(
//        """
//        SELECT m FROM Match m
//        WHERE m.status = :status
//        AND (:sport IS NULL OR m.sport = :sport)
//        AND (:latitude IS NULL OR :longitude IS NULL OR :radiusKm IS NULL
//            OR (6371 * acos(
//                cos(radians(:latitude)) * cos(radians(m.latitude)) *
//                cos(radians(m.longitude) - radians(:longitude)) +
//                sin(radians(:latitude)) * sin(radians(m.latitude))
//            )) <= :radiusKm)
//        ORDER BY m.scheduledAt ASC
//        """
//    )
//    fun searchMatchesByLocation(
//        @Param("sport") sport: String?,
//        @Param("status") status: MatchStatus?,
//        @Param("latitude") latitude: Double?,
//        @Param("longitude") longitude: Double?,
//        @Param("radiusKm") radiusKm: Double?
//    ): List<Match>
}
