package ru.larkin.messagingservice.dto.resp

import ru.larkin.messagingservice.entity.ChatType
import java.time.Instant

data class ChatResponse(
    val id: Long,
    val chatType: ChatType,
    val name: String?,
    val matchId: Long?,
    val participants: List<String>,
    val lastMessage: MessageResponse?,
    val updatedAt: Instant
)
