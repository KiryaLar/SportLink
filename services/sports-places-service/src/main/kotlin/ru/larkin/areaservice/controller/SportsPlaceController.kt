package ru.larkin.areaservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import ru.larkin.areaservice.dto.req.SportsPlaceCreateRequest
import ru.larkin.areaservice.dto.req.SportsPlaceSearchRequest
import ru.larkin.areaservice.dto.req.SportsPlaceUpdateRequest
import ru.larkin.areaservice.dto.resp.SportsPlaceResponse
import ru.larkin.areaservice.dto.resp.SportsPlaceSummaryResponse
import ru.larkin.areaservice.entity.SportsPlaceStatus
import ru.larkin.areaservice.service.SportsPlaceService
import java.util.UUID

@RestController
@RequestMapping("/api/v1/sports-places")
class SportsPlaceController(
    private val sportsPlaceService: SportsPlaceService
) {

    @GetMapping
    fun getAllSportsPlaces(): ResponseEntity<List<SportsPlaceSummaryResponse>> {
        return ResponseEntity.ok(sportsPlaceService.getAllSportsPlaces())
    }

    @PostMapping("/search")
    fun searchSportsPlaces(@RequestBody request: SportsPlaceSearchRequest): ResponseEntity<List<SportsPlaceSummaryResponse>> {
        return ResponseEntity.ok(sportsPlaceService.searchSportsPlaces(request))
    }

    @GetMapping("/{id}")
    fun getSportsPlaceById(@PathVariable("id") placeId: Long): ResponseEntity<SportsPlaceResponse> {
        return ResponseEntity.ok(sportsPlaceService.getSportsPlaceById(placeId))
    }

    @PostMapping
    fun createSportsPlace(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: SportsPlaceCreateRequest
    ): ResponseEntity<SportsPlaceResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(sportsPlaceService.createSportsPlace(userId, request))
    }

    @PutMapping("/{id}")
    fun updateSportsPlace(
        @PathVariable("id") placeId: Long,
        @RequestBody request: SportsPlaceUpdateRequest
    ): ResponseEntity<SportsPlaceResponse> {
        return ResponseEntity.ok(sportsPlaceService.updateSportsPlace(placeId, request))
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    fun updateSportsPlaceStatus(
        @PathVariable("id") placeId: Long,
        @RequestParam status: SportsPlaceStatus
    ): ResponseEntity<SportsPlaceResponse> {
        return ResponseEntity.ok(sportsPlaceService.updateSportsPlaceStatus(placeId, status))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteSportsPlace(@PathVariable("id") placeId: Long): ResponseEntity<Unit> {
        sportsPlaceService.deleteSportsPlace(placeId)
        return ResponseEntity.noContent().build()
    }
}
