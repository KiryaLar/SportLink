package ru.larkin.profileservice.dto.req

import ru.larkin.profileservice.entity.Sport

data class ProfileUpdateRequest(
    val name: String? = null,
    val phone: String? = null,
    val city: String? = null,
    val description: String? = null,
    val sports: List<SportInfoRequest>? = null
)
