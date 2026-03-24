package ru.larkin.notificationservice.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.notificationservice.entity.Notification
import ru.larkin.notificationservice.entity.NotificationStatus
import ru.larkin.notificationservice.entity.NotificationType
import java.util.UUID

interface NotificationRepository : JpaRepository<Notification, Long> {

    fun findByUserId(userId: UUID): List<Notification>

    fun findByUserIdOrderByCreatedAtDesc(userId: UUID, pageable: Pageable): Page<Notification>

    @Query(
        """
        SELECT n FROM Notification n
        WHERE n.userId = :userId AND n.status = :status
        ORDER BY n.createdAt DESC
        """
    )
    fun findByUserIdAndStatus(
        @Param("userId") userId: UUID,
        @Param("status") status: NotificationStatus,
        pageable: Pageable
    ): Page<Notification>

    @Query(
        """
        SELECT COUNT(n) FROM Notification n
        WHERE n.userId = :userId AND n.status != 'READ'
        """
    )
    fun countUnreadByUserId(@Param("userId") userId: UUID): Long

    @Query(
        """
        SELECT COUNT(n) FROM Notification n
        WHERE n.userId = :userId
        """
    )
    fun countTotalByUserId(@Param("userId") userId: UUID): Long

    fun findByUserIdAndType(userId: UUID, type: NotificationType): List<Notification>

    fun deleteByUserId(userId: UUID)

    @Query(
        """
        SELECT n FROM Notification n
        WHERE n.userId = :userId
        AND n.entityId = :entityId
        AND n.entityType = :entityType
        ORDER BY n.createdAt DESC
        """
    )
    fun findByUserAndEntity(
        @Param("userId") userId: UUID,
        @Param("entityId") entityId: Long,
        @Param("entityType") entityType: String
    ): List<Notification>
}
