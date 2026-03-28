package ru.larkin.profileservice.dto.req

import jakarta.validation.constraints.AssertTrue

data class ContactStatusRequest(
    val status: String
) {
    @AssertTrue(message = "status must be one of: PENDING, ACCEPTED, CANCELED, BLOCKED")
    fun isStatusValid(): Boolean =
        status in setOf("PENDING", "ACCEPTED", "CANCELED", "BLOCKED")
}
