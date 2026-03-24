package ru.larkin.keycloakeventlistener

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.core.ProducerFactory
import org.springframework.kafka.core.DefaultKafkaProducerFactory
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.common.serialization.StringSerializer
import org.springframework.kafka.support.serializer.JsonSerializer
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
