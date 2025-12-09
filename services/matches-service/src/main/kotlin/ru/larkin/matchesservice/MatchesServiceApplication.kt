package ru.larkin.matchesservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MatchesServiceApplication

fun main(args: Array<String>) {
    runApplication<MatchesServiceApplication>(*args)
}

