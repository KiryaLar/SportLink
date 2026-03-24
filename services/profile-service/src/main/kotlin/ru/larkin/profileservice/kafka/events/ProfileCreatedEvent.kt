package ru.larkin.profileservice.kafka.events

import java.util.UUID

data class ProfileCreatedEvent(
    val keycloakUserId: UUID,
    val email: String
)