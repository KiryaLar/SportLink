package ru.larkin.matchesservice.dto.req

data class MatchSearchRequest(
    val sport: String? = null,
    val city: String? = null,
    val dateFrom: java.time.Instant? = null,
    val dateTo: java.time.Instant? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val radiusKm: Double? = null,
    val minLevel: Int? = null,
    val maxLevel: Int? = null,
    val status: ru.larkin.matchesservice.entity.MatchStatus? = null
)
