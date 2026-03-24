package ru.larkin.messagingservice.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.messagingservice.entity.Message
import java.util.UUID

interface MessageRepository : JpaRepository<Message, Long> {

    @Query(
        """
        SELECT m FROM Message m
        WHERE m.chat.id = :chatId
        ORDER BY m.createdAt DESC
        """
    )
    fun findByChatIdOrderByCreatedAtDesc(@Param("chatId") chatId: Long, pageable: Pageable): Page<Message>

    @Query(
        """
        SELECT m FROM Message m
        WHERE m.chat.id = :chatId
        AND m.createdAt > :since
        ORDER BY m.createdAt ASC
        """
    )
    fun findNewMessagesByChatId(
        @Param("chatId") chatId: Long,
        @Param("since") since: java.time.Instant
    ): List<Message>

    fun countByChatIdAndStatus(chatId: Long, status: ru.larkin.messagingservice.entity.MessageStatus): Long

    @Query(
        """
        SELECT m FROM Message m
        WHERE m.chat.id = :chatId
        AND m.senderId != :userId
        AND m.status = 'SENT'
        """
    )
    fun findUnreadMessages(@Param("chatId") chatId: Long, @Param("userId") userId: UUID): List<Message>

    fun deleteByChatId(chatId: Long)
}
