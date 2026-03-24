package ru.larkin.profileservice.dto.resp

data class ContactResponse(
    val id: Long,
    val contact: ProfileSummaryResponse,
    val status: ContactStatusResponse
)
