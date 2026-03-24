package ru.larkin.matchesservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.matchesservice.entity.MatchParticipant
import java.util.UUID

interface MatchParticipantRepository : JpaRepository<MatchParticipant, Long> {

    fun findByMatchId(matchId: Long): List<MatchParticipant>

    fun findByUserId(userId: UUID): List<MatchParticipant>

    @Query(
        """
        SELECT mp FROM MatchParticipant mp
        WHERE mp.match.id = :matchId AND mp.userId = :userId
        """
    )
    fun findByMatchIdAndUserId(@Param("matchId") matchId: Long, @Param("userId") userId: UUID): MatchParticipant?

    fun existsByMatchIdAndUserId(matchId: Long, userId: UUID): Boolean

    fun countByMatchId(matchId: Long): Long

    fun deleteByMatchId(matchId: Long)
}
