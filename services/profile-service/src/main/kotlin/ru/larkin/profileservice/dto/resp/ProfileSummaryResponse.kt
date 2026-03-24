package ru.larkin.profileservice.dto.resp

data class ProfileSummaryResponse(
    val id: Long,
    val name: String?,
    val city: String?,
    val avatarUrl: String?,
)