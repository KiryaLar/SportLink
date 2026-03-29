package ru.larkin.matchesservice.dto.resp

import ru.larkin.matchesservice.entity.MatchStatus
import java.time.Instant

data class MatchResponse(
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
    val description: String?,
    val status: MatchStatus,
    val participants: List<MatchParticipantResponse>,
    val createdAt: Instant,
    val updatedAt: Instant
)
