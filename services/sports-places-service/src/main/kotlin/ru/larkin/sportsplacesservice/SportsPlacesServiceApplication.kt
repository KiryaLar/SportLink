package ru.larkin.sportsplacesservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@SpringBootApplication
@EnableJpaAuditing
class AreaServiceApplication

fun main(args: Array<String>) {
    runApplication<AreaServiceApplication>(*args)
}
