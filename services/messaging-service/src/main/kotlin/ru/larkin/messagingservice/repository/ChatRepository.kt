package ru.larkin.messagingservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.messagingservice.entity.Chat
import java.util.UUID

interface ChatRepository : JpaRepository<Chat, Long> {

    @Query(
        """
        SELECT c FROM Chat c
        JOIN c.participants p
        WHERE p.userId = :userId AND p.status = 'ACTIVE'
        AND c.chatType = 'DIRECT'
        """
    )
    fun findDirectChatsByUserId(@Param("userId") userId: UUID): List<Chat>

    @Query(
        """
        SELECT c FROM Chat c
        JOIN c.participants p
        WHERE p.userId = :userId AND p.status = 'ACTIVE'
        AND c.chatType = 'MATCH'
        """
    )
    fun findMatchChatsByUserId(@Param("userId") userId: UUID): List<Chat>

    @Query(
        """
        SELECT c FROM Chat c
        JOIN c.participants p1 ON p1.chat = c
        JOIN c.participants p2 ON p2.chat = c
        WHERE p1.userId = :userId1 
        AND p2.userId = :userId2 
        AND c.chatType = 'DIRECT'
        """
    )
    fun findDirectChatBetweenUsers(
        @Param("userId1") userId1: UUID,
        @Param("userId2") userId2: UUID
    ): Chat?

    fun findByMatchId(matchId: Long): Chat?

    @Query(
        """
        SELECT c FROM Chat c
        JOIN c.participants p
        WHERE p.userId = :userId AND p.status = 'ACTIVE'
        ORDER BY c.updatedAt DESC
        """
    )
    fun findChatsByUserId(@Param("userId") userId: UUID): List<Chat>
}
