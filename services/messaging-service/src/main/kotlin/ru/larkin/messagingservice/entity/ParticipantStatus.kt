package ru.larkin.messagingservice.entity

enum class ParticipantStatus {
    ACTIVE,     // Активный участник
    LEFT,       // Покинул чат
    KICKED,     // Исключён
    BLOCKED     // Заблокирован
}
