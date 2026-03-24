package ru.larkin.profileservice.kafka.consumer

import org.slf4j.LoggerFactory
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.Acknowledgment
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Component
import ru.larkin.profileservice.service.ProfileService
import java.util.UUID

@Component
class KeycloakEventConsumer(
    private val profileService: ProfileService
) {

    private val log = LoggerFactory.getLogger(KeycloakEventConsumer::class.java)

    @KafkaListener(
        topics = ["keycloak-profile-updates"],
        groupId = "profile-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    fun handleKeycloakEvent(
        @Payload event: ru.larkin.profileservice.kafka.events.KeycloakEvent,
        acknowledgment: Acknowledgment
    ) {
        try {
            log.info("Received Kafka event: type={}, userId={}", event.type, event.userId)

            when (event.type) {
                "USER_CREATED" -> handleUserCreated(event)
                "USER_UPDATED" -> handleUserUpdated(event)
                "USER_DELETED" -> handleUserDeleted(event)
                else -> log.warn("Unknown event type: {}", event.type)
            }

            acknowledgment.acknowledge()
            log.info("Event processed successfully: userId={}", event.userId)

        } catch (e: Exception) {
            log.error("Error processing event: userId=${event.userId}", e)
            // Не ack'им — Kafka попробует снова
            throw e
        }
    }

    private fun handleUserCreated(event: ru.larkin.profileservice.kafka.events.KeycloakEvent) {
        val userId = UUID.fromString(event.userId)
        val email = event.email ?: throw IllegalArgumentException("Email is required for USER_CREATED event")
        val name = event.username ?: email.substringBefore('@')

        // Создаём минимальный профиль
        val profile = profileService.createMinimalProfile(
            keycloakUserId = userId,
            email = email,
            name = name
        )

        log.info("Profile created for user $userId with profileId=${profile.id}")
    }

    private fun handleUserUpdated(event: ru.larkin.profileservice.kafka.events.KeycloakEvent) {
        val userId = UUID.fromString(event.userId)
        
        event.email?.let { newEmail ->
            profileService.updateEmail(userId, newEmail)
            log.info("Email updated for user $userId: newEmail=$newEmail")
        }
    }

    private fun handleUserDeleted(event: ru.larkin.profileservice.kafka.events.KeycloakEvent) {
        val userId = UUID.fromString(event.userId)
        profileService.deactivateProfile(userId)
        log.info("Profile deactivated for user $userId")
    }
}
