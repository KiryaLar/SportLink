package ru.larkin.profileservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import ru.larkin.profileservice.dto.req.ProfileCreateRequest
import ru.larkin.profileservice.dto.req.ProfileUpdateRequest
import ru.larkin.profileservice.dto.resp.*
import ru.larkin.profileservice.service.ContactService
import ru.larkin.profileservice.service.ProfileService
import java.util.UUID

@RestController
@RequestMapping("/profiles")
class ProfileController(
    private val profileService: ProfileService,
    private val contactService: ContactService
) {

    @GetMapping
    fun getProfileSummaries(): ResponseEntity<List<ProfileSummaryResponse>> {
        return ResponseEntity.ok(profileService.getProfileSummaries())
    }

    @GetMapping("/{id}")
    fun getProfileById(@PathVariable("id") profileId: Long): ResponseEntity<ProfileResponse> {
        return ResponseEntity.ok(profileService.getProfileById(profileId))
    }

    @GetMapping("/my")
    fun getMyProfile(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<ProfileResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(profileService.getProfileByUserId(userId))
    }

    @GetMapping("/search")
    fun searchProfiles(
        @RequestParam(required = false) sport: String?,
        @RequestParam(required = false) city: String?,
        @RequestParam(required = false) minLevel: Int?,
        @RequestParam(required = false) maxLevel: Int?
    ): ResponseEntity<List<ProfileSummaryResponse>> {
        return ResponseEntity.ok(profileService.searchProfiles(sport, city, minLevel, maxLevel))
    }

    @PostMapping
    fun createProfile(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: ProfileCreateRequest
    ): ResponseEntity<ProfileResponse> {
        val userId = UUID.fromString(jwt.subject)
        val email = jwt.getClaimAsString("email") ?: request.email
        return ResponseEntity.ok(profileService.createProfile(userId, email, request))
    }

    @PutMapping("/my")
    fun updateProfile(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: ProfileUpdateRequest
    ): ResponseEntity<ProfileResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(profileService.updateProfile(userId, request))
    }

    @GetMapping("/my/contacts")
    fun getMyContacts(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<ProfileSummaryResponse>> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(contactService.getContactsByUserId(userId))
    }

    @PostMapping("/{id}/contact")
    fun sendContactRequest(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable("id") targetProfileId: Long
    ): ResponseEntity<ContactResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(contactService.sendContactRequest(userId, targetProfileId))
    }

    @PutMapping("/contacts/{contactId}/status")
    fun updateContactStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable("contactId") contactId: Long,
        @RequestParam status: ContactStatusResponse
    ): ResponseEntity<ContactResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(contactService.updateContactStatus(userId, contactId, status))
    }

    @DeleteMapping("/contacts/{contactId}")
    fun removeContact(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable("contactId") contactId: Long
    ): ResponseEntity<Unit> {
        val userId = UUID.fromString(jwt.subject)
        contactService.removeContact(userId, contactId)
        return ResponseEntity.noContent().build()
    }
}
