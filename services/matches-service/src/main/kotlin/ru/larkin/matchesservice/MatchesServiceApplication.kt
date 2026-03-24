package ru.larkin.matchesservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@SpringBootApplication
@EnableJpaAuditing
class MatchesServiceApplication

fun main(args: Array<String>) {
    runApplication<MatchesServiceApplication>(*args)
}
