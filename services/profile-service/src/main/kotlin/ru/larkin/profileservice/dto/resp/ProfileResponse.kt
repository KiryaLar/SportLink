package ru.larkin.profileservice.dto.resp

data class ProfileResponse(
    val id: Long,
    val name: String?,
    val email: String?,
    val phone: String?,
    val city: String?,
    val age: Int?,
    val avatarUrl: String?,
    val description: String?,
    val sports: List<SportInfoResponse>,
    val ratingAvg: Double,
    val ratingCount: Long
)
