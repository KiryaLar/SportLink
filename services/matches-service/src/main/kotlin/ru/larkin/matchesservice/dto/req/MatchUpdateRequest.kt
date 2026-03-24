package ru.larkin.matchesservice.dto.req

data class MatchUpdateRequest(
    val title: String? = null,
    val scheduledAt: java.time.Instant? = null,
    val locationName: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val maxParticipants: Int? = null,
    val minLevel: Int? = null,
    val maxLevel: Int? = null,
    val description: String? = null
)
