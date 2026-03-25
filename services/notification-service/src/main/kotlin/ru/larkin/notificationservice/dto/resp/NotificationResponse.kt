package ru.larkin.notificationservice.dto.resp

import ru.larkin.notificationservice.entity.NotificationStatus
import ru.larkin.notificationservice.entity.NotificationType
import java.time.Instant

data class NotificationResponse(
    val id: Long,
    val userId: String,
    val type: NotificationType,
    val title: String,
    val message: String,
    val entityId: Long?,
    val entityType: String?,
    val status: NotificationStatus,
    val createdAt: Instant
)
