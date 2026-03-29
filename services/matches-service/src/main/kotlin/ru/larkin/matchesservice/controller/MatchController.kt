package ru.larkin.matchesservice.controller

import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import ru.larkin.matchesservice.dto.req.MatchCreateRequest
import ru.larkin.matchesservice.dto.req.MatchSearchRequest
import ru.larkin.matchesservice.dto.req.MatchUpdateRequest
import ru.larkin.matchesservice.dto.resp.MatchParticipantResponse
import ru.larkin.matchesservice.dto.resp.MatchResponse
import ru.larkin.matchesservice.dto.resp.MatchSummaryResponse
import ru.larkin.matchesservice.entity.MatchStatus
import ru.larkin.matchesservice.service.MatchParticipantService
import ru.larkin.matchesservice.service.MatchService
import java.util.UUID

@RestController
@RequestMapping("/matches")
class MatchController(
    private val matchService: MatchService,
    private val participantService: MatchParticipantService
) {

    @GetMapping
    fun getAllMatches(): ResponseEntity<List<MatchSummaryResponse>> {
        return ResponseEntity.ok(matchService.getAllMatches())
    }

    @PostMapping("/search")
    fun searchMatches(@Valid @RequestBody request: MatchSearchRequest): ResponseEntity<List<MatchSummaryResponse>> {
        return ResponseEntity.ok(matchService.searchMatches(request))
    }

    @GetMapping("/{id}")
    fun getMatchById(@PathVariable("id") matchId: Long): ResponseEntity<MatchResponse> {
        return ResponseEntity.ok(matchService.getMatchById(matchId))
    }

    @GetMapping("/organizer/my")
    fun getMyOrganizedMatches(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<MatchSummaryResponse>> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(matchService.getMatchesByOrganizer(userId))
    }

    @PostMapping
    fun createMatch(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: MatchCreateRequest
    ): ResponseEntity<MatchResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(matchService.createMatch(userId, request))
    }

    @PutMapping("/{id}")
    fun updateMatch(
        @PathVariable("id") matchId: Long,
        @Valid @RequestBody request: MatchUpdateRequest
    ): ResponseEntity<MatchResponse> {
        return ResponseEntity.ok(matchService.updateMatch(matchId, request))
    }

    @PatchMapping("/{matchId}/status")
    @PreAuthorize("hasRole('ADMIN') or @matchService.isOrganizer(#matchId, authentication)")
    fun updateMatchStatus(
        @PathVariable("matchId") matchId: Long,
        @RequestParam status: MatchStatus
    ): ResponseEntity<MatchResponse> {
        return ResponseEntity.ok(matchService.updateMatchStatus(matchId, status))
    }

    @DeleteMapping("/{matchId}")
    @PreAuthorize("hasRole('ADMIN') or @matchService.isOrganizer(#matchId, authentication)")
    fun deleteMatch(@PathVariable("matchId") matchId: Long): ResponseEntity<Unit> {
        matchService.deleteMatch(matchId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/participants")
    fun getMatchParticipants(@PathVariable("id") matchId: Long): ResponseEntity<List<MatchParticipantResponse>> {
        return ResponseEntity.ok(participantService.getParticipantsByMatchId(matchId))
    }

    @PostMapping("/{id}/join")
    fun joinMatch(
        @PathVariable("id") matchId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<MatchParticipantResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(participantService.joinMatch(matchId, userId))
    }

    @PostMapping("/{id}/leave")
    fun leaveMatch(
        @PathVariable("id") matchId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<Unit> {
        val userId = UUID.fromString(jwt.subject)
        participantService.leaveMatch(matchId, userId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("{matchId}/participants/{participantId}/confirm")
    @PreAuthorize("hasRole('ADMIN') or @matchService.isOrganizer(#matchId, authentication)")
    fun confirmParticipant(
        @PathVariable("matchId") matchId: Long,
        @PathVariable("participantId") participantId: Long,
    ): ResponseEntity<Unit> {
        participantService.confirmParticipant(matchId, participantId)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("{matchId}/participants/{participantId}")
    @PreAuthorize("hasRole('ADMIN') or @matchService.isOrganizerOfParticipant(#matchId, authentication)")
    fun removeParticipant(
        @PathVariable("matchId") matchId: Long,
        @PathVariable("participantId") participantId: Long,
    ): ResponseEntity<Unit> {
        participantService.removeParticipant(matchId, participantId)
        return ResponseEntity.noContent().build()
    }
}
