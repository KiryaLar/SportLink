package ru.larkin.common.events

import java.time.Instant
import java.util.UUID

/**
 * Событие матча для Kafka
 */
data class MatchEvent(
    val matchId: Long,
    val type: MatchEventType,
    val organizerId: UUID,
    val title: String,
    val sport: String,
    val scheduledAt: Instant,
    val sportsPlaceId: Long,
    val maxParticipants: Int,
    val currentParticipants: Int,
    val status: String,
    val timestamp: Instant = Instant.now(),
//    TODO: Додумать
    val participantId: UUID? = null,
    val participantName: String? = null
)

enum class MatchEventType {
    CREATED,
    UPDATED,
    CANCELLED,
    JOINED,
    LEFT,
    STARTED,
    FINISHED
}
