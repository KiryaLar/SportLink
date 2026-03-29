package ru.larkin.notificationservice.kafka.consumer

import org.slf4j.LoggerFactory
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.Acknowledgment
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Component
import ru.larkin.common.events.MatchEvent
import ru.larkin.common.events.MatchEventType
import ru.larkin.common.events.NotificationEvent
import ru.larkin.common.events.NotificationType
import ru.larkin.common.events.Priority
import ru.larkin.notificationservice.service.NotificationService

@Component
class MatchEventConsumer(
    private val notificationService: NotificationService
) {

    private val log = LoggerFactory.getLogger(MatchEventConsumer::class.java)

    @KafkaListener(
        topics = ["match-events"],
        groupId = "notification-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    fun handleMatchEvent(
        @Payload event: MatchEvent,
        acknowledgment: Acknowledgment
    ) {
        try {
            log.info("Received match event: type={}, matchId={}", event.type, event.matchId)

            when (event.type) {
                MatchEventType.CREATED -> handleMatchCreated(event)
                MatchEventType.JOINED -> handleMatchJoined(event)
                MatchEventType.CANCELLED -> handleMatchCancelled(event)
                MatchEventType.FINISHED -> handleMatchFinished(event)
                else -> log.info("Skipping match event type: {}", event.type)
            }

            acknowledgment.acknowledge()
            log.info("Match event processed successfully: matchId={}", event.matchId)

        } catch (e: Exception) {
            log.error("Error processing match event: matchId=${event.matchId}", e)
            throw e
        }
    }

    private fun handleMatchCreated(event: MatchEvent) {
        // Уведомляем только организатора о создании матча (для подтверждения)
        val notification = NotificationEvent(
            userId = event.organizerId,
            type = NotificationType.MATCH_INVITE,
            title = "Матч создан",
            message = "Ваш матч \"${event.title}\" создан и ожидает участников",
            relatedEntityId = event.matchId.toString(),
            relatedEntityType = "MATCH",
            priority = Priority.NORMAL
        )
        notificationService.saveNotification(notification)
    }

    private fun handleMatchJoined(event: MatchEvent) {
        // Уведомляем организатора о присоединении участника
        event.participantId?.let { participantId ->
            val notification = NotificationEvent(
                userId = event.organizerId,
                type = NotificationType.MATCH_JOINED,
                title = "Новый участник",
                message = "${event.participantName ?: "Игрок"}} присоединился к матчу \"${event.title}\"",
                relatedEntityId = event.matchId.toString(),
                relatedEntityType = "MATCH",
                priority = Priority.NORMAL
            )
            notificationService.saveNotification(notification)
        }
    }

    private fun handleMatchCancelled(event: MatchEvent) {
        // Уведомляем всех участников об отмене матча
        // В реальном приложении нужно получить всех участников из БД
        val notification = NotificationEvent(
            userId = event.organizerId,
            type = NotificationType.MATCH_CANCELLED,
            title = "Матч отменён",
            message = "Матч \"${event.title}\" был отменён",
            relatedEntityId = event.matchId.toString(),
            relatedEntityType = "MATCH",
            priority = Priority.HIGH
        )
        notificationService.saveNotification(notification)
    }

    private fun handleMatchFinished(event: MatchEvent) {
        // Уведомляем участников о завершении матча и возможности оставить отзыв
        val notification = NotificationEvent(
            userId = event.organizerId,
            type = NotificationType.MATCH_FINISHED,
            title = "Матч завершён",
            message = "Матч \"${event.title}\" завершён. Оставьте отзывы об участниках!",
            relatedEntityId = event.matchId.toString(),
            relatedEntityType = "MATCH",
            priority = Priority.NORMAL
        )
        notificationService.saveNotification(notification)
    }
}
