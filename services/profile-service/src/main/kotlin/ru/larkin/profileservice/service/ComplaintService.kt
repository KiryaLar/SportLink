package ru.larkin.profileservice.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.profileservice.dto.req.ComplaintRequest
import ru.larkin.profileservice.dto.resp.ComplaintResponse
import ru.larkin.profileservice.entity.Complaint
import ru.larkin.profileservice.entity.ComplaintStatus
import ru.larkin.profileservice.exception.NotFoundException
import ru.larkin.profileservice.exception.ProfileServiceException
import ru.larkin.profileservice.repository.ComplaintRepository
import ru.larkin.profileservice.repository.ProfileRepository
import java.util.UUID

@Service
class ComplaintService(
    private val complaintRepository: ComplaintRepository,
    private val profileRepository: ProfileRepository
) {

    @Transactional
    fun createComplaint(userId: UUID, request: ComplaintRequest): ComplaintResponse {
        val reporterProfile = profileRepository.findByKeycloakUserId(userId)
            ?: throw NotFoundException.userNotFound(userId)

        val targetProfile = profileRepository.findById(request.targetProfileId)
            .orElseThrow { NotFoundException.profileNotFound(request.targetProfileId) }

        if (reporterProfile.id == request.targetProfileId) {
            throw ProfileServiceException(
                ru.larkin.profileservice.exception.ProfileErrorType.VALIDATION,
                "Нельзя подать жалобу на себя"
            )
        }

        val complaint = Complaint(
            reporterProfile = reporterProfile,
            targetProfile = targetProfile,
            complaintType = request.complaintType,
            complaintText = request.complaintText
        )

        val savedComplaint = complaintRepository.save(complaint)

        // Увеличиваем счетчик жалок у целевого профиля
        targetProfile.complaintCount++
        profileRepository.save(targetProfile)

        return savedComplaint.toComplaintResponse()
    }

    @Transactional(readOnly = true)
    fun getComplaintsByTargetProfileId(targetProfileId: Long): List<ComplaintResponse> {
        return complaintRepository.findByTargetProfileId(targetProfileId)
            .map { it.toComplaintResponse() }
    }

    @Transactional(readOnly = true)
    fun getComplaintsByStatus(status: ComplaintStatus, pageable: Pageable): Page<ComplaintResponse> {     
        return complaintRepository.findByStatus(status, pageable)
            .map { it.toComplaintResponse() }
    }

    @Transactional(readOnly = true)
    fun getAllComplaints(pageable: Pageable): Page<ComplaintResponse> {
        return complaintRepository.findAll(pageable)
            .map { it.toComplaintResponse() }
    }

    @Transactional
    fun reviewComplaint(complaintId: Long, status: ComplaintStatus) {
        val complaint = complaintRepository.findById(complaintId)
            .orElseThrow { NotFoundException.complainNotFound(complaintId) }

        complaint.status = status
        complaint.reviewedAt = java.time.Instant.now()
        complaintRepository.save(complaint)
    }

    @Transactional
    fun deleteComplaint(complaintId: Long) {
        if (!complaintRepository.existsById(complaintId)) {
            throw NotFoundException.complainNotFound(complaintId)
        }
        complaintRepository.deleteById(complaintId)
    }
}

private fun Complaint.toComplaintResponse(): ComplaintResponse {
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
