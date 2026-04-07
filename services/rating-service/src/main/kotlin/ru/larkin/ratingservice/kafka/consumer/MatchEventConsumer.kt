package ru.larkin.ratingservice.kafka.consumer

import org.slf4j.LoggerFactory
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.Acknowledgment
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Component
import ru.larkin.common.events.MatchEvent
import ru.larkin.common.events.MatchEventType

@Component
class MatchEventConsumer {

    private val log = LoggerFactory.getLogger(MatchEventConsumer::class.java)

    @KafkaListener(
        topics = ["match-events"],
        groupId = "rating-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    fun handleMatchEvent(
        @Payload event: MatchEvent,
        acknowledgment: Acknowledgment
    ) {
        try {
            log.info("Received match event: type={}, matchId={}", event.type, event.matchId)

            when (event.type) {
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

    private fun handleMatchFinished(event: MatchEvent) {
        log.info("Match finished: matchId={}, title={}. Participants can now leave reviews.", event.matchId, event.title)
        // В будущем можно создать "ожидающие отзывы" для каждого участника
        // или отправить уведомления участникам о возможности оставить отзыв
    }
}
