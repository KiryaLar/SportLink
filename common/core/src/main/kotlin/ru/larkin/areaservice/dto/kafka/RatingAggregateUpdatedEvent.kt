package ru.larkin.areaservice.dto.kafka

import java.time.Instant
import java.util.*

data class RatingAggregateUpdatedEvent(
//    Unique event ID to ensure idempotency
    val eventId: UUID,
    val profileId: Long,
    val avg: Double,
    val count: Long,
//    Monotonically increasing version ID for specific profile
    val versionId: Long,
    val occurredAt: Instant
)