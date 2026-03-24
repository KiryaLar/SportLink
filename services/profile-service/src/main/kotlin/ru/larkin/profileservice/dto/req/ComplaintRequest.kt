package ru.larkin.profileservice.dto.req

import ru.larkin.profileservice.entity.ComplaintType

data class ComplaintRequest(
    val targetProfileId: Long,
    val complaintType: ComplaintType,
    val complaintText: String
)
