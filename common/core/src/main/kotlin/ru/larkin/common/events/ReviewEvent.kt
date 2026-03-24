package ru.larkin.common.events

import java.time.Instant
import java.util.UUID

/**
 * Событие рейтинга/отзыва для Kafka
 */
data class ReviewEvent(
    val reviewId: Long,
    val authorId: UUID,
    val targetUserId: UUID,
    val matchId: Long,
    val reviewType: String,
    val rating: Int,
    val skillLevel: String?,
    val comment: String?,
    val timestamp: Instant = Instant.now()
)
