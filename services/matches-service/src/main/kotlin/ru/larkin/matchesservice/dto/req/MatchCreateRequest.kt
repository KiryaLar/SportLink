package ru.larkin.matchesservice.dto.req

import java.time.Instant

data class MatchCreateRequest(
    val title: String,
    val sport: String,
    val scheduledAt: Instant,
    val locationName: String,
    val latitude: Double,
    val longitude: Double,
    val maxParticipants: Int,
    val minLevel: Int = 1,
    val maxLevel: Int = 10,
    val description: String? = null
)
