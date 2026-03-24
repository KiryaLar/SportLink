package ru.larkin.profileservice.dto.req

import ru.larkin.profileservice.entity.Sport

data class SportInfoRequest(
    val sport: Sport,
    val level: Int,
    val description: String? = null
)