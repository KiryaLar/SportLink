package ru.larkin.messagingservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker

@SpringBootApplication
@EnableJpaAuditing
@EnableWebSocketMessageBroker
class MessagingServiceApplication

fun main(args: Array<String>) {
    runApplication<MessagingServiceApplication>(*args)
}
