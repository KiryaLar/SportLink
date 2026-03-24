package ru.larkin.profileservice.dto.resp

import ru.larkin.profileservice.entity.ComplaintStatus
import ru.larkin.profileservice.entity.ComplaintType
import java.time.Instant

data class ComplaintResponse(
    val id: Long,
    val reporterProfileId: Long,
    val targetProfileId: Long,
    val complaintType: ComplaintType,
    val complaintText: String,
    val status: ComplaintStatus,
    val createdAt: Instant,
    val reviewedAt: Instant?
)
