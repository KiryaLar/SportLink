package ru.larkin.profileservice.kafka.config

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.StringDeserializer
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafka
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory
import org.springframework.kafka.core.ConsumerFactory
import org.springframework.kafka.core.DefaultKafkaConsumerFactory
import org.springframework.kafka.support.serializer.JacksonJsonDeserializer
import ru.larkin.profileservice.kafka.events.KeycloakEvent

@EnableKafka
@Configuration
class KafkaConfig(
    @Value("\${spring.kafka.bootstrap-servers}")
    private val bootstrapServers: String,
    @Value("\${spring.kafka.consumer.group-id:profile-service}")
    private val groupId: String
) {

    @Bean
    fun consumerFactory(): ConsumerFactory<String, KeycloakEvent> {
        val props = mapOf(
            ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG to bootstrapServers,
            ConsumerConfig.GROUP_ID_CONFIG to groupId,
            ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java,
            ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG to JacksonJsonDeserializer::class.java,
            ConsumerConfig.AUTO_OFFSET_RESET_CONFIG to "earliest",
            ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG to "false",
            JacksonJsonDeserializer.TRUSTED_PACKAGES to "ru.larkin.profileservice.kafka.events"
        )
        return DefaultKafkaConsumerFactory(
            props,
            StringDeserializer(),
            JacksonJsonDeserializer(KeycloakEvent::class.java)
        )
    }

    @Bean
    fun kafkaListenerContainerFactory(): ConcurrentKafkaListenerContainerFactory<String, KeycloakEvent> {
        val factory = ConcurrentKafkaListenerContainerFactory<String, KeycloakEvent>()
        factory.setConsumerFactory(consumerFactory())
        factory.setConcurrency(3) // Параллельная обработка
        return factory
    }
}
