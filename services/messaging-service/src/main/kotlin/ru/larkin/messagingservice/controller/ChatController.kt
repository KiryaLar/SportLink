package ru.larkin.messagingservice.controller

import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import ru.larkin.messagingservice.dto.req.SendMessageRequest
import ru.larkin.messagingservice.dto.resp.ChatResponse
import ru.larkin.messagingservice.dto.resp.MessageResponse
import ru.larkin.messagingservice.service.ChatService
import java.util.UUID

@RestController
@RequestMapping("/api/v1/chats")
class ChatController(
    private val chatService: ChatService
) {

    @GetMapping
    fun getMyChats(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<ChatResponse>> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(chatService.getChatsByUserId(userId))
    }

    @GetMapping("/direct")
    fun getMyDirectChats(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<ChatResponse>> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(chatService.getDirectChatsByUserId(userId))
    }

    @GetMapping("/match")
    fun getMyMatchChats(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<ChatResponse>> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(chatService.getMatchChatsByUserId(userId))
    }

    @GetMapping("/{id}")
    fun getChatById(@PathVariable("id") chatId: Long): ResponseEntity<ChatResponse> {
        return ResponseEntity.ok(chatService.getChatById(chatId))
    }

    @GetMapping("/{id}/messages")
    fun getChatMessages(
        @PathVariable("id") chatId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<List<MessageResponse>> {
        val messages = chatService.getMessagesByChatId(chatId, PageRequest.of(page, size))
        return ResponseEntity.ok(messages.content)
    }

    @PostMapping("/{id}/messages")
    fun sendMessage(
        @PathVariable("id") chatId: Long,
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: SendMessageRequest
    ): ResponseEntity<MessageResponse> {
        val senderId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(chatService.sendMessage(chatId, senderId, request))
    }

    @PostMapping("/{id}/read")
    fun markAsRead(
        @PathVariable("id") chatId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Unit> {
        val userId = UUID.fromString(jwt.subject)
        chatService.markMessagesAsRead(chatId, userId)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/{id}/unread-count")
    fun getUnreadCount(
        @PathVariable("id") chatId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Long> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(chatService.getUnreadMessagesCount(chatId, userId))
    }

    @DeleteMapping("/{id}")
    fun deleteChat(@PathVariable("id") chatId: Long): ResponseEntity<Unit> {
        chatService.deleteChat(chatId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/direct")
    fun getOrCreateDirectChat(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam participantId: String
    ): ResponseEntity<ChatResponse> {
        val myUserId = UUID.fromString(jwt.subject)
        val otherUserId = UUID.fromString(participantId)
        return ResponseEntity.ok(chatService.getOrCreateDirectChat(myUserId, otherUserId))
    }
}
