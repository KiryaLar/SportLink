package ru.larkin.notificationservice.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.common.events.NotificationEvent
import ru.larkin.common.events.NotificationType
import ru.larkin.notificationservice.dto.resp.NotificationCountResponse
import ru.larkin.notificationservice.dto.resp.NotificationResponse
import ru.larkin.notificationservice.entity.Notification
import ru.larkin.notificationservice.entity.NotificationStatus
import ru.larkin.notificationservice.exception.NotFoundException
import ru.larkin.notificationservice.repository.NotificationRepository
import java.util.UUID

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {

    @Transactional(readOnly = true)
    fun getNotificationsByUserId(userId: UUID, pageable: Pageable): Page<NotificationResponse> {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map { it.toNotificationResponse() }
    }

    @Transactional(readOnly = true)
    fun getUnreadNotifications(userId: UUID, pageable: Pageable): Page<NotificationResponse> {
        return notificationRepository.findByUserIdAndStatus(userId, NotificationStatus.PENDING, pageable)
            .map { it.toNotificationResponse() }
    }

    @Transactional(readOnly = true)
    fun getNotificationById(notificationId: Long): NotificationResponse {
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { NotFoundException.notificationNotFound(notificationId) }
        return notification.toNotificationResponse()
    }

    @Transactional(readOnly = true)
    fun getNotificationCount(userId: UUID): NotificationCountResponse {
        val totalCount = notificationRepository.countTotalByUserId(userId)
        val unreadCount = notificationRepository.countUnreadByUserId(userId)
        return NotificationCountResponse(totalCount, unreadCount)
    }

    @Transactional
    fun createNotification(
        userId: UUID,
        type: NotificationType,
        title: String,
        message: String,
        entityId: Long? = null,
        entityType: String? = null,
        data: String? = null
    ): NotificationResponse {
        val notification = Notification(
            userId = userId,
            type = type,
            title = title,
            message = message,
            entityId = entityId,
            entityType = entityType,
            status = NotificationStatus.PENDING,
            data = data
        )

        val savedNotification = notificationRepository.save(notification)
        return savedNotification.toNotificationResponse()
    }

    @Transactional
    fun markAsRead(notificationId: Long) {
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { NotFoundException.notificationNotFound(notificationId) }
        notification.markAsRead()
        notificationRepository.save(notification)
    }

    @Transactional
    fun markAllAsRead(userId: UUID) {
        val unreadNotifications = notificationRepository.findByUserIdAndStatus(
            userId,
            NotificationStatus.PENDING,
            Pageable.unpaged()
        )
        unreadNotifications.forEach { it.markAsRead() }
        notificationRepository.saveAll(unreadNotifications)
    }

    @Transactional
    fun deleteNotification(notificationId: Long) {
        if (!notificationRepository.existsById(notificationId)) {
            throw NotFoundException.notificationNotFound(notificationId)
        }
        notificationRepository.deleteById(notificationId)
    }

    @Transactional
    fun deleteAllNotifications(userId: UUID) {
        notificationRepository.deleteByUserId(userId)
    }

    // Методы для отправки уведомлений из других сервисов
    @Transactional
    fun sendMatchInviteNotification(userId: UUID, matchId: Long, matchTitle: String) {
        createNotification(
            userId = userId,
            type = NotificationType.MATCH_INVITE,
            title = "Приглашение в матч",
            message = "Вас пригласили присоединиться к матчу \"$matchTitle\"",
            entityId = matchId,
            entityType = "MATCH"
        )
    }

    @Transactional
    fun sendMatchUpdateNotification(userId: UUID, matchId: Long, matchTitle: String, updateMessage: String) {
        createNotification(
            userId = userId,
            type = NotificationType.MATCH_UPDATE,
            title = "Обновление матча",
            message = "В матче \"$matchTitle\": $updateMessage",
            entityId = matchId,
            entityType = "MATCH"
        )
    }

    @Transactional
    fun sendMatchCancelledNotification(userId: UUID, matchId: Long, matchTitle: String) {
        createNotification(
            userId = userId,
            type = NotificationType.MATCH_CANCELLED,
            title = "Матч отменён",
            message = "Матч \"$matchTitle\" был отменён",
            entityId = matchId,
            entityType = "MATCH"
        )
    }

    @Transactional
    fun sendNewMessageNotification(userId: UUID, chatId: Long, senderName: String) {
        createNotification(
            userId = userId,
            type = NotificationType.NEW_MESSAGE,
            title = "Новое сообщение",
            message = "$senderName отправил вам сообщение",
            entityId = chatId,
            entityType = "CHAT"
        )
    }

    @Transactional
    fun sendContactRequestNotification(userId: UUID, requesterId: Long, requesterName: String) {
        createNotification(
            userId = userId,
            type = NotificationType.CONTACT_REQUEST,
            title = "Запрос в контакты",
            message = "$requesterName хочет добавить вас в контакты",
            entityId = requesterId,
            entityType = "PROFILE"
        )
    }

    @Transactional
    fun sendReviewReceivedNotification(userId: UUID, matchId: Long, reviewerName: String) {
        createNotification(
            userId = userId,
            type = NotificationType.REVIEW_RECEIVED,
            title = "Новый отзыв",
            message = "$reviewerName оставил вам отзыв",
            entityId = matchId,
            entityType = "MATCH"
        )
    }

    // Метод для сохранения уведомления из Kafka события
    @Transactional
    fun saveNotification(event: NotificationEvent) {
        createNotification(
            userId = event.userId,
            type = event.type,
            title = event.title,
            message = event.message,
            entityId = event.relatedEntityId?.toLongOrNull(),
            entityType = event.relatedEntityType
        )
    }
}

private fun Notification.toNotificationResponse(): NotificationResponse {
    return NotificationResponse(
        id = id!!,
        userId = userId.toString(),
        type = type,
        title = title,
        message = message,
        entityId = entityId,
        entityType = entityType,
        status = status,
        createdAt = createdAt
    )
}
