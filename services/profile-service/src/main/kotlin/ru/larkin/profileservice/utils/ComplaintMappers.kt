package ru.larkin.profileservice.utils

import ru.larkin.profileservice.dto.resp.ComplaintResponse
import ru.larkin.profileservice.entity.Complaint

fun Complaint.toComplaintResponse(): ComplaintResponse {
    return ComplaintResponse(
        id = id!!,
        reporterProfileId = reporterProfile.id!!,
        targetProfileId = targetProfile.id!!,
        complaintType = complaintType,
        complaintText = complaintText,
        status = status,
        createdAt = createdAt,
        reviewedAt = reviewedAt
    )
}
