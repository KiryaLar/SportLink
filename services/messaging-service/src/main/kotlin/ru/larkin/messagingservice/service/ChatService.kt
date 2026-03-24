package ru.larkin.messagingservice.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.messagingservice.dto.req.SendMessageRequest
import ru.larkin.messagingservice.dto.resp.ChatResponse
import ru.larkin.messagingservice.dto.resp.MessageResponse
import ru.larkin.messagingservice.entity.Chat
import ru.larkin.messagingservice.entity.ChatType
import ru.larkin.messagingservice.entity.Message
import ru.larkin.messagingservice.entity.MessageStatus
import ru.larkin.messagingservice.exception.NotFoundException
import ru.larkin.messagingservice.repository.ChatRepository
import ru.larkin.messagingservice.repository.MessageRepository
import java.time.Instant
import java.util.UUID

@Service
class ChatService(
    private val chatRepository: ChatRepository,
    private val messageRepository: MessageRepository
) {

    @Transactional(readOnly = true)
    fun getChatById(chatId: Long): ChatResponse {
        val chat = chatRepository.findById(chatId)
            .orElseThrow { NotFoundException.chatNotFound(chatId) }
        return chat.toChatResponse()
    }

    @Transactional(readOnly = true)
    fun getChatsByUserId(userId: UUID): List<ChatResponse> {
        return chatRepository.findChatsByUserId(userId)
            .map { it.toChatResponse() }
    }

    @Transactional(readOnly = true)
    fun getDirectChatsByUserId(userId: UUID): List<ChatResponse> {
        return chatRepository.findDirectChatsByUserId(userId)
            .map { it.toChatResponse() }
    }

    @Transactional(readOnly = true)
    fun getMatchChatsByUserId(userId: UUID): List<ChatResponse> {
        return chatRepository.findMatchChatsByUserId(userId)
            .map { it.toChatResponse() }
    }

    @Transactional
    fun getOrCreateDirectChat(userId1: UUID, userId2: UUID): ChatResponse {
        val existingChat = chatRepository.findDirectChatBetweenUsers(userId1, userId2)
        if (existingChat != null) {
            return existingChat.toChatResponse()
        }

        val chat = Chat(
            chatType = ChatType.DIRECT,
            name = null
        )
        chat.addParticipant(userId1)
        chat.addParticipant(userId2)

        val savedChat = chatRepository.save(chat)
        return savedChat.toChatResponse()
    }

    @Transactional
    fun createMatchChat(matchId: Long, participants: List<UUID>): ChatResponse {
        val chat = Chat(
            chatType = ChatType.MATCH,
            matchId = matchId,
            name = "Match #$matchId"
        )
        participants.forEach { chat.addParticipant(it) }

        val savedChat = chatRepository.save(chat)
        return savedChat.toChatResponse()
    }

    @Transactional(readOnly = true)
    fun getMessagesByChatId(chatId: Long, pageable: Pageable): Page<MessageResponse> {
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable)
            .map { it.toMessageResponse() }
    }

    @Transactional
    fun sendMessage(chatId: Long, senderId: UUID, request: SendMessageRequest): MessageResponse {
        val chat = chatRepository.findById(chatId)
            .orElseThrow { NotFoundException.chatNotFound(chatId) }

        if (!chat.isParticipant(senderId)) {
            throw ru.larkin.messagingservice.exception.ChatServiceException("Вы не являетесь участником этого чата")
        }

        val message = Message(
            senderId = senderId,
            content = request.content,
            chat = chat,
            status = MessageStatus.SENT
        )

        chat.messages.add(message)
        chat.updatedAt = Instant.now()

        chatRepository.save(chat)
        val savedMessage = messageRepository.save(message)

        return savedMessage.toMessageResponse()
    }

    @Transactional
    fun markMessagesAsRead(chatId: Long, userId: UUID) {
        val unreadMessages = messageRepository.findUnreadMessages(chatId, userId)
        unreadMessages.forEach {
            it.status = MessageStatus.READ
        }
        messageRepository.saveAll(unreadMessages)
    }

    @Transactional
    fun deleteChat(chatId: Long) {
        if (!chatRepository.existsById(chatId)) {
            throw NotFoundException.chatNotFound(chatId)
        }
        messageRepository.deleteByChatId(chatId)
        chatRepository.deleteById(chatId)
    }

    @Transactional(readOnly = true)
    fun getUnreadMessagesCount(chatId: Long, userId: UUID): Long {
        return messageRepository.countByChatIdAndStatus(chatId, MessageStatus.SENT)
    }

    @Transactional
    fun sendMessage(chatId: Long, senderId: UUID, content: String): MessageResponse {
        val chat = chatRepository.findById(chatId)
            .orElseThrow { NotFoundException.chatNotFound(chatId) }

        if (!chat.isParticipant(senderId)) {
            throw ru.larkin.messagingservice.exception.ChatServiceException("Вы не являетесь участником этого чата")
        }

        val message = Message(
            senderId = senderId,
            content = content,
            chat = chat,
            status = MessageStatus.SENT
        )

        chat.messages.add(message)
        chat.updatedAt = Instant.now()

        chatRepository.save(chat)
        val savedMessage = messageRepository.save(message)

        return savedMessage.toMessageResponse()
    }
}

private fun Chat.toChatResponse(): ChatResponse {
    val lastMessage = messages.maxByOrNull { it.createdAt }
    return ChatResponse(
        id = id!!,
        chatType = chatType,
        name = name,
        matchId = matchId,
        participants = participants
            .filter { it.status == ru.larkin.messagingservice.entity.ParticipantStatus.ACTIVE }
            .map { it.userId.toString() },
        lastMessage = lastMessage?.toMessageResponse(),
        updatedAt = updatedAt
    )
}

private fun Message.toMessageResponse(): MessageResponse {
    return MessageResponse(
        id = id!!,
        chatId = chat.id!!,
        senderId = senderId,
        content = content,
        status = status,
        createdAt = createdAt
    )
}
