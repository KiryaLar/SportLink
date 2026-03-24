package ru.larkin.keycloakeventlistener

import org.keycloak.events.Event
import org.keycloak.events.EventListenerProvider
import org.keycloak.events.EventType
import org.slf4j.LoggerFactory
import ru.larkin.keycloakeventlistener.events.KeycloakEvent
import java.util.UUID

class ProfileEventListener : EventListenerProvider {

    companion object {
        private val log = LoggerFactory.getLogger(ProfileEventListener::class.java)
    }

    override fun onEvent(event: Event) {
        val kafkaTemplate = ProfileEventListenerFactory.getKafkaTemplate()
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not initialized, skipping event")
            return
        }

        val kafkaEvent = when (event.type) {
            EventType.REGISTER -> {
                log.info("User registered: userId={}, email={}", event.userId, event.details?.get("email"))
                KeycloakEvent(
                    id = UUID.randomUUID().toString(),
                    type = "USER_CREATED",
                    realmId = event.realmId,
                    userId = event.userId,
                    username = event.details?.get("username"),
                    email = event.details?.get("email"),
                    timestamp = event.time,
                    details = event.details
                )
            }
            EventType.UPDATE_EMAIL -> {
                log.info("User email updated: userId={}, newEmail={}", event.userId, event.details?.get("email"))
                KeycloakEvent(
                    id = UUID.randomUUID().toString(),
                    type = "USER_UPDATED",
                    realmId = event.realmId,
                    userId = event.userId,
                    username = null,
                    email = event.details?.get("email"),
                    timestamp = event.time,
                    details = event.details
                )
            }
            EventType.REMOVE_TOTP -> {
                log.info("User removed TOTP: userId={}", event.userId)
                KeycloakEvent(
                    id = UUID.randomUUID().toString(),
                    type = "USER_UPDATED",
                    realmId = event.realmId,
                    userId = event.userId,
                    username = null,
                    email = null,
                    timestamp = event.time,
                    details = event.details
                )
            }
            else -> {
                log.debug("Ignoring event type: {}", event.type)
                return
            }
        }

        // Отправка в Kafka асинхронно
        try {
            kafkaTemplate.send("keycloak-profile-updates", kafkaEvent.userId, kafkaEvent)
                .whenComplete { result, exception ->
                    if (exception != null) {
                        log.error("Failed to send event to Kafka: ${exception.message}", exception)
                    } else {
                        log.info(
                            "Event sent to Kafka: topic={}, partition={}, offset={}",
                            result.recordMetadata.topic(),
                            result.recordMetadata.partition(),
                            result.recordMetadata.offset()
                        )
                    }
                }
        } catch (e: Exception) {
            log.error("Error sending event to Kafka", e)
        }
    }

    override fun onEvent(event: Event, details: Boolean) {
        onEvent(event)
    }

    override fun close() {
        // Закрытие ресурсов
    }
}
