package ru.larkin.messagingservice.dto.req

import java.util.UUID

data class CreateDirectChatRequest(
    val participantId: UUID
)
