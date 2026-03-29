package ru.larkin.keycloakeventlistener

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.kafka.core.KafkaTemplate
import jakarta.annotation.PostConstruct

@SpringBootApplication
@ConfigurationPropertiesScan
class KeycloakEventListenerApplication(
    private val kafkaTemplate: KafkaTemplate<String, Any>
) {

    @PostConstruct
    fun init() {
        // Передаём KafkaTemplate в Keycloak SPI
        ProfileEventListenerFactory.setKafkaTemplate(kafkaTemplate)
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            runApplication<KeycloakEventListenerApplication>(*args)
        }
    }
}
