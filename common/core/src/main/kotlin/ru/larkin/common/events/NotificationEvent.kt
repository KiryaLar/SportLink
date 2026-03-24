package ru.larkin.common.events

import java.time.Instant
import java.util.UUID

/**
 * Событие уведомления для Kafka
 */
data class NotificationEvent(
    val id: String = UUID.randomUUID().toString(),
    val userId: UUID,
    val type: NotificationType,
    val title: String,
    val message: String,
    val relatedEntityId: String? = null,
    val relatedEntityType: String? = null,
    val priority: Priority = Priority.NORMAL,
    val timestamp: Instant = Instant.now()
)

enum class NotificationType {
    MATCH_INVITE,
    MATCH_JOINED,
    MATCH_CANCELLED,
    MATCH_STARTED,
    MATCH_UPDATE,
    MATCH_FINISHED,
    REVIEW_RECEIVED,
    NEW_MESSAGE,
    CONTACT_REQUEST,
    CONTACT_ACCEPTED,
    SYSTEM
}

enum class Priority {
    LOW,
    NORMAL,
    HIGH,
    URGENT
}
