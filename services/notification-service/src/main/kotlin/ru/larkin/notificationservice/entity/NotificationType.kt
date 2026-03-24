package ru.larkin.notificationservice.entity

enum class NotificationType {
    MATCH_INVITE,
    MATCH_JOINED,
    MATCH_UPDATE,
    MATCH_CANCELLED,
    MATCH_STARTED,
    MATCH_FINISHED,
    NEW_MESSAGE,
    CONTACT_REQUEST,
    CONTACT_ACCEPTED,
    REVIEW_RECEIVED,
    SYSTEM,
    ADMIN
}
