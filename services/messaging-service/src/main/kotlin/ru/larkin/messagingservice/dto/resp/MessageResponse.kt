package ru.larkin.messagingservice.dto.resp

import ru.larkin.messagingservice.entity.MessageStatus
import java.time.Instant
import java.util.UUID

data class MessageResponse(
    val id: Long,
    val chatId: Long,
    val senderId: UUID,
    val content: String,
    val status: MessageStatus,
    val createdAt: Instant
)
