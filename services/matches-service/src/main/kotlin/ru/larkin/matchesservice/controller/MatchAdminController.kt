package ru.larkin.matchesservice.controller

import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import ru.larkin.matchesservice.dto.resp.MatchResponse
import ru.larkin.matchesservice.entity.MatchStatus
import ru.larkin.matchesservice.service.MatchService
import ru.larkin.matchesservice.utils.toMatchSummaryResponse

@RestController
@RequestMapping("/admin/matches")
class MatchAdminController(
    private val matchService: MatchService
) {

    /**
     * Получить все матчи (ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllMatches(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<Map<String, Any>> {
        val matches = matchService.getAllMatchesAdmin(PageRequest.of(page, size))
        return ResponseEntity.ok(mapOf(
            "content" to matches.content.map { it.toMatchSummaryResponse() },
            "total" to matches.totalElements
        ))
    }

    /**
     * Получить матч по ID (ADMIN)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun getMatchById(@PathVariable("id") matchId: Long): ResponseEntity<MatchResponse> {
        return ResponseEntity.ok(matchService.getMatchById(matchId))
    }

    /**
     * Отменить матч (ADMIN)
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    fun cancelMatch(@PathVariable("id") matchId: Long): ResponseEntity<MatchResponse> {
        return ResponseEntity.ok(matchService.updateMatchStatus(matchId, MatchStatus.CANCELLED))
    }

    /**
     * Удалить матч (ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteMatch(@PathVariable("id") matchId: Long): ResponseEntity<Unit> {
        matchService.deleteMatch(matchId)
        return ResponseEntity.noContent().build()
    }
}
