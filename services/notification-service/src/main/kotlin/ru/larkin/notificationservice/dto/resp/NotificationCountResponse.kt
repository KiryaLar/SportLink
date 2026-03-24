package ru.larkin.notificationservice.dto.resp

data class NotificationCountResponse(
    val totalCount: Long,
    val unreadCount: Long
)
