package ru.larkin.common.events

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.Instant

/**
 * Базовое событие для межсервисной коммуникации через Kafka
 */
data class DomainEvent(
    val id: String,
    val type: EventType,
    val aggregateId: String,
    val aggregateType: String,
    val timestamp: Instant = Instant.now(),
    val version: Int = 1,
    @JsonProperty("data")
    val payload: Map<String, Any?> = emptyMap()
)

enum class EventType {
    // Profile events
    PROFILE_CREATED,
    PROFILE_UPDATED,
    PROFILE_DELETED,

    // Match events
    MATCH_CREATED,
    MATCH_UPDATED,
    MATCH_CANCELLED,
    MATCH_JOINED,
    MATCH_LEFT,
    MATCH_STARTED,
    MATCH_FINISHED,

    // Rating events
    REVIEW_CREATED,
    REVIEW_UPDATED,
    REVIEW_DELETED,

    // Notification events
    NOTIFICATION_CREATED,
    NOTIFICATION_SENT,

    // Message events
    MESSAGE_SENT,
    MESSAGE_DELIVERED,

    // Sports place events
    SPORTS_PLACE_CREATED,
    SPORTS_PLACE_UPDATED,
    SPORTS_PLACE_DELETED
}
