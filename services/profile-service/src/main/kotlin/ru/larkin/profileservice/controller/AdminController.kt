package ru.larkin.profileservice.controller

import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import ru.larkin.profileservice.dto.resp.ComplaintResponse
import ru.larkin.profileservice.dto.resp.ProfileResponse
import ru.larkin.profileservice.entity.ComplaintStatus
import ru.larkin.profileservice.service.ComplaintService
import ru.larkin.profileservice.service.ProfileAdminService
import ru.larkin.profileservice.utils.toComplaintResponse
import ru.larkin.profileservice.utils.toProfileResponse

@RestController
@RequestMapping("/admin")
class AdminController(
    private val profileAdminService: ProfileAdminService,
    private val complaintService: ComplaintService
) {

    /**
     * Получить всех пользователей (ADMIN)
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllUsers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<Map<String, Any>> {
        val profiles = profileAdminService.getAllProfiles(PageRequest.of(page, size))
        val avatarUrlBuilder: (String?) -> String = { key -> key ?: "" }
        return ResponseEntity.ok(mapOf(
            "content" to profiles.content.map { it.toProfileResponse(avatarUrlBuilder) },
            "total" to profiles.totalElements
        ))
    }

    /**
     * Получить профиль по ID (ADMIN)
     */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun getUserById(@PathVariable("id") profileId: Long): ResponseEntity<ProfileResponse> {
        TODO("Implement if needed")
    }

    /**
     * Заблокировать пользователя (ADMIN)
     */
    @PostMapping("/users/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    fun blockUser(@PathVariable("id") profileId: Long): ResponseEntity<Unit> {
        profileAdminService.blockProfile(profileId)
        return ResponseEntity.ok().build()
    }

    /**
     * Разблокировать пользователя (ADMIN)
     */
    @PostMapping("/users/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    fun unblockUser(@PathVariable("id") profileId: Long): ResponseEntity<Unit> {
        profileAdminService.unblockProfile(profileId)
        return ResponseEntity.ok().build()
    }

    /**
     * Удалить пользователя (ADMIN)
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteUser(@PathVariable("id") profileId: Long): ResponseEntity<Unit> {
        profileAdminService.deleteProfile(profileId)
        return ResponseEntity.noContent().build()
    }

    /**
     * Получить все жалобы (ADMIN)
     */
    @GetMapping("/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllComplaints(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<Map<String, Any>> {
        val complaints = complaintService.getAllComplaints(PageRequest.of(page, size))
        return ResponseEntity.ok(mapOf(
            "content" to complaints.content,
            "total" to complaints.totalElements
        ))
    }

    /**
     * Рассмотреть жалобу (ADMIN)
     */
    @PostMapping("/complaints/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    fun resolveComplaint(
        @PathVariable("id") complaintId: Long,
        @RequestParam status: ComplaintStatus
    ): ResponseEntity<Unit> {
        complaintService.reviewComplaint(complaintId, status)
        return ResponseEntity.ok().build()
    }

    /**
     * Получить статистику (ADMIN)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    fun getStatistics(): ResponseEntity<Map<String, Long>> {
        val stats = profileAdminService.getStatistics()
        return ResponseEntity.ok(stats)
    }
}
