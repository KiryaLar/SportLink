package ru.larkin.messagingservice.controller

import org.springframework.messaging.handler.annotation.DestinationVariable
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Controller
import ru.larkin.messagingservice.dto.req.MessageCreateRequest
import ru.larkin.messagingservice.dto.resp.MessageResponse
import ru.larkin.messagingservice.service.ChatService
import java.time.Instant
import java.util.UUID

@Controller
class WebSocketChatController(
    private val messagingTemplate: SimpMessagingTemplate,
    private val chatService: ChatService
) {

    /**
     * Обработка входящих сообщений через WebSocket
     * Клиент отправляет на /app/chat/{chatId}/message
     * Сообщение сохраняется в БД и рассылается подписчикам /topic/chat/{chatId}
     */
    @MessageMapping("/chat/{chatId}/message")
    @SendTo("/topic/chat/{chatId}")
    fun sendMessage(
        @DestinationVariable chatId: Long,
        @Payload request: MessageCreateRequest,
        @AuthenticationPrincipal principal: Jwt
    ): MessageResponse {
        val senderId = principal.subject

        // Сохраняем сообщение в БД
        val savedMessage = chatService.sendMessage(chatId, UUID.fromString(senderId), request.content)

        return savedMessage
    }

    /**
     * Отправка сообщения о наборе текста (typing indicator)
     * Не сохраняется в БД, только realtime уведомление
     */
    @MessageMapping("/chat/{chatId}/typing")
    @SendTo("/topic/chat/{chatId}/typing")
    fun sendTypingIndicator(
        @DestinationVariable chatId: Long,
        @AuthenticationPrincipal principal: Jwt
    ): TypingIndicator {
        val senderId = principal.subject
        return TypingIndicator(
            chatId = chatId,
            userId = senderId,
            timestamp = Instant.now()
        )
    }
}

/**
 * Модель для индикации набора текста
 */
data class TypingIndicator(
    val chatId: Long,
    val userId: String,
    val timestamp: Instant
)
