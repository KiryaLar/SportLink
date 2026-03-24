package ru.larkin.ratingservice.controller

import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import ru.larkin.ratingservice.dto.req.ReviewCreateRequest
import ru.larkin.ratingservice.dto.resp.ReviewResponse
import ru.larkin.ratingservice.dto.resp.UserRatingResponse
import ru.larkin.ratingservice.entity.ReviewType
import ru.larkin.ratingservice.service.RatingService
import java.util.UUID

@RestController
@RequestMapping("/api/v1/ratings")
class RatingController(
    private val ratingService: RatingService
) {

    @GetMapping("/users/{userId}")
    fun getUserRating(@PathVariable("userId") userId: String): ResponseEntity<UserRatingResponse> {
        val userUuid = UUID.fromString(userId)
        val rating = ratingService.getUserRating(userUuid)
            ?: ratingService.getUserRatingOrCreate(userUuid)
        return ResponseEntity.ok(rating)
    }

    @GetMapping("/users/{userId}/reviews")
    fun getUserReviews(
        @PathVariable("userId") userId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<List<ReviewResponse>> {
        val userUuid = UUID.fromString(userId)
        val reviews = ratingService.getReviewsByUserId(userUuid, PageRequest.of(page, size))
        return ResponseEntity.ok(reviews.content)
    }

    @GetMapping("/users/{userId}/reviews/type")
    fun getUserReviewsByType(
        @PathVariable("userId") userId: String,
        @RequestParam type: ReviewType,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<List<ReviewResponse>> {
        val userUuid = UUID.fromString(userId)
        val reviews = ratingService.getReviewsByUserIdAndType(userUuid, type, PageRequest.of(page, size))
        return ResponseEntity.ok(reviews.content)
    }

    @GetMapping("/matches/{matchId}/reviews")
    fun getMatchReviews(@PathVariable("matchId") matchId: Long): ResponseEntity<List<ReviewResponse>> {
        return ResponseEntity.ok(ratingService.getReviewsByMatchId(matchId))
    }

    @PostMapping
    fun createReview(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: ReviewCreateRequest
    ): ResponseEntity<ReviewResponse> {
        val authorId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(ratingService.createReview(authorId, request))
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteReview(@PathVariable("reviewId") reviewId: Long): ResponseEntity<Unit> {
        ratingService.deleteReview(reviewId)
        return ResponseEntity.noContent().build()
    }
}
