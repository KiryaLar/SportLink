package ru.larkin.profileservice.controller

import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import ru.larkin.profileservice.dto.req.ComplaintRequest
import ru.larkin.profileservice.dto.resp.ComplaintResponse
import ru.larkin.profileservice.entity.ComplaintStatus
import ru.larkin.profileservice.service.ComplaintService
import java.util.UUID

@RestController
@RequestMapping("/api/v1/complaints")
class ComplaintController(
    private val complaintService: ComplaintService
) {

    @PostMapping
    fun createComplaint(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: ComplaintRequest
    ): ResponseEntity<ComplaintResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(complaintService.createComplaint(userId, request))
    }

    @GetMapping("/target/{profileId}")
    fun getComplaintsByTargetProfile(
        @PathVariable("profileId") targetProfileId: Long
    ): ResponseEntity<List<ComplaintResponse>> {
        return ResponseEntity.ok(complaintService.getComplaintsByTargetProfileId(targetProfileId))
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    fun getPendingComplaints(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<List<ComplaintResponse>> {
        return ResponseEntity.ok(
            complaintService.getComplaintsByStatus(ComplaintStatus.PENDING, PageRequest.of(page, size)).content
        )
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    fun reviewComplaint(
        @PathVariable("id") complaintId: Long,
        @RequestParam status: ComplaintStatus
    ): ResponseEntity<Unit> {
        complaintService.reviewComplaint(complaintId, status)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteComplaint(@PathVariable("id") complaintId: Long): ResponseEntity<Unit> {
        complaintService.deleteComplaint(complaintId)
        return ResponseEntity.noContent().build()
    }
}
