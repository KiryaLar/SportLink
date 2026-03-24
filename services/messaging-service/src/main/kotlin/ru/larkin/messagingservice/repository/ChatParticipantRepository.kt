package ru.larkin.messagingservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.messagingservice.entity.ChatParticipant
import java.util.UUID

interface ChatParticipantRepository : JpaRepository<ChatParticipant, Long> {

    @Query(
        """
        SELECT cp FROM ChatParticipant cp
        WHERE cp.chat.id = :chatId AND cp.userId = :userId
        """
    )
    fun findByChatIdAndUserId(
        @Param("chatId") chatId: Long,
        @Param("userId") userId: UUID
    ): ChatParticipant?

    @Query(
        """
        SELECT cp FROM ChatParticipant cp
        WHERE cp.chat.id = :chatId AND cp.status = 'ACTIVE'
        """
    )
    fun findActiveParticipantsByChatId(@Param("chatId") chatId: Long): List<ChatParticipant>

    fun findByUserId(userId: UUID): List<ChatParticipant>

    fun countByChatIdAndStatus(chatId: Long, status: ru.larkin.messagingservice.entity.ParticipantStatus): Long
}
