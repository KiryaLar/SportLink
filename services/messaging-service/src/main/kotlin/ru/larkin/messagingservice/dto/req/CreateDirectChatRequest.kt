package ru.larkin.messagingservice.dto.req

import jakarta.validation.constraints.NotNull
import java.util.UUID

data class CreateDirectChatRequest(
    @field:NotNull(message = "participantId обязателен")
    val participantId: UUID
)
