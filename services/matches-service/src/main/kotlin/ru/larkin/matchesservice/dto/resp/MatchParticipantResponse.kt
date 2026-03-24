package ru.larkin.matchesservice.dto.resp

import ru.larkin.matchesservice.entity.ParticipantStatus
import java.time.Instant

data class MatchParticipantResponse(
    val id: Long,
    val userId: String,
    val playerName: String?,
    val status: ParticipantStatus,
    val joinedAt: Instant
)
