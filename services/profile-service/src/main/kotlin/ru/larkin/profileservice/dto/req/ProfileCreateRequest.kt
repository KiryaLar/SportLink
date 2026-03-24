package ru.larkin.profileservice.dto.req

data class ProfileCreateRequest(
    val name: String,
    val email: String,
    val phone: String,
    val city: String,
    val age: Int,
    val description: String? = null,
    val sports: List<SportInfoRequest> = emptyList()
)