package ru.larkin.profileservice.dto.resp

data class SportInfoResponse(
    val id: Long,
    val sport: String,
    val level: Int,
    val description: String?
//    val isFavorite: Boolean
)
