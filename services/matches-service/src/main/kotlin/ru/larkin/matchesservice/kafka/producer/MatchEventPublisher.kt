package ru.larkin.matchesservice.kafka.producer

import org.slf4j.LoggerFactory
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component
import ru.larkin.common.events.MatchEvent
import ru.larkin.common.events.MatchEventType

@Component
class MatchEventPublisher(
    private val kafkaTemplate: KafkaTemplate<String, Any>
) {

    private val log = LoggerFactory.getLogger(MatchEventPublisher::class.java)
    private val topic = "match-events"

    fun publishMatchCreated(event: MatchEvent) {
        publish(event.copy(type = MatchEventType.CREATED))
    }

    fun publishMatchUpdated(event: MatchEvent) {
        publish(event.copy(type = MatchEventType.UPDATED))
    }

    fun publishMatchCancelled(event: MatchEvent) {
        publish(event.copy(type = MatchEventType.CANCELLED))
    }

    fun publishMatchJoined(event: MatchEvent, participantId: java.util.UUID, participantName: String?) {
        publish(event.copy(type = MatchEventType.JOINED, participantId = participantId, participantName = participantName))
    }

    fun publishMatchLeft(event: MatchEvent, participantId: java.util.UUID, participantName: String?) {
        publish(event.copy(type = MatchEventType.LEFT, participantId = participantId, participantName = participantName))
    }

    fun publishMatchStarted(event: MatchEvent) {
        publish(event.copy(type = MatchEventType.STARTED))
    }

    fun publishMatchFinished(event: MatchEvent) {
        publish(event.copy(type = MatchEventType.FINISHED))
    }

    private fun publish(event: MatchEvent) {
        val key = event.matchId.toString()
        log.info("Publishing match event: type={}, matchId={}", event.type, event.matchId)

        kafkaTemplate.send(topic, key, event)
            .whenComplete { result, exception ->
                if (exception == null) {
                    log.info("Match event published successfully: type={}, matchId={}, offset={}",
                        event.type, event.matchId, result.recordMetadata.offset())
                } else {
                    log.error("Failed to publish match event: type={}, matchId={}", event.type, event.matchId, exception)
                }
            }
    }
}
