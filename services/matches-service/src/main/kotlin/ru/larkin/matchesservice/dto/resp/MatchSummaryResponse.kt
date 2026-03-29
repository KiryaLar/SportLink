package ru.larkin.matchesservice.dto.resp

import ru.larkin.matchesservice.entity.MatchStatus
import java.time.Instant

data class MatchSummaryResponse(
    val id: Long,
    val organizerId: String,
    val title: String,
    val sport: String,
    val scheduledAt: Instant,
    val sportsPlaceId: Long,
    val maxParticipants: Int,
    val currentParticipants: Int,
    val minLevel: Int,
    val maxLevel: Int,
    val status: MatchStatus
)
