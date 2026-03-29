package ru.larkin.keycloakeventlistener

import org.keycloak.events.EventListenerProvider
import org.keycloak.events.EventListenerProviderFactory
import org.keycloak.models.KeycloakSession
import org.keycloak.models.KeycloakSessionFactory
import org.springframework.kafka.core.KafkaTemplate

class ProfileEventListenerFactory : EventListenerProviderFactory {

    companion object {
        const val PROVIDER_ID = "sportlink-profile-event-listener"
        private var kafkaTemplate: KafkaTemplate<String, Any>? = null

        @JvmStatic
        fun setKafkaTemplate(template: KafkaTemplate<String, Any>) {
            kafkaTemplate = template
        }

        @JvmStatic
        fun getKafkaTemplate(): KafkaTemplate<String, Any>? = kafkaTemplate
    }

    override fun getId(): String = PROVIDER_ID

    override fun create(session: KeycloakSession): EventListenerProvider {
        return ProfileEventListener()
    }

    override fun init(config: org.keycloak.Config.Scope) {
        // Инициализация Kafka будет выполнена из Spring контекста
    }

    /**
     * Вызывается после инициализации всех провайдеров
     * Требуется для Keycloak 24+
     */
    override fun postInit(sessionFactory: KeycloakSessionFactory?) {
        // Пост-инициализация (не требуется для текущей реализации)
    }

    override fun close() {
        // Закрытие ресурсов (если нужно)
    }
}
