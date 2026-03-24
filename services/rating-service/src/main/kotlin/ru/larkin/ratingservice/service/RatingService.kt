package ru.larkin.ratingservice.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.ratingservice.dto.req.ReviewCreateRequest
import ru.larkin.ratingservice.dto.resp.ReviewResponse
import ru.larkin.ratingservice.dto.resp.UserRatingResponse
import ru.larkin.ratingservice.entity.*
import ru.larkin.ratingservice.exception.NotFoundException
import ru.larkin.ratingservice.exception.RatingServiceException
import ru.larkin.ratingservice.repository.ReviewRepository
import ru.larkin.ratingservice.repository.UserRatingRepository
import java.util.UUID

@Service
class RatingService(
    private val reviewRepository: ReviewRepository,
    private val userRatingRepository: UserRatingRepository
) {

    @Transactional
    fun createReview(authorId: UUID, request: ReviewCreateRequest): ReviewResponse {
        val targetUserId = UUID.fromString(request.targetUserId)

        // Проверяем, не оставлял ли автор уже отзыв для этого пользователя за этот матч
        if (reviewRepository.existsByAuthorIdAndTargetUserIdAndMatchId(
                authorId,
                targetUserId,
                request.matchId
            )
        ) {
            throw RatingServiceException("Вы уже оставляли отзыв для этого пользователя за данный матч")
        }

        // Валидация рейтинга
        if (request.rating < 1 || request.rating > 5) {
            throw RatingServiceException("Рейтинг должен быть от 1 до 5")
        }

        val review = Review(
            authorId = authorId,
            targetUserId = targetUserId,
            matchId = request.matchId,
            reviewType = request.reviewType,
            rating = request.rating,
            skillLevel = request.skillLevel,
            comment = request.comment
        )

        val savedReview = reviewRepository.save(review)

        // Обновляем агрегированный рейтинг пользователя
        updateUserRating(targetUserId)

        return savedReview.toReviewResponse()
    }

    @Transactional(readOnly = true)
    fun getReviewsByUserId(userId: UUID, pageable: Pageable): Page<ReviewResponse> {
        return reviewRepository.findByTargetUserIdOrderByCreatedAtDesc(userId, pageable)
            .map { it.toReviewResponse() }
    }

    @Transactional(readOnly = true)
    fun getReviewsByUserIdAndType(
        userId: UUID,
        reviewType: ReviewType,
        pageable: Pageable
    ): Page<ReviewResponse> {
        return reviewRepository.findByUserIdAndType(userId, reviewType, pageable)
            .map { it.toReviewResponse() }
    }

    @Transactional(readOnly = true)
    fun getReviewsByMatchId(matchId: Long): List<ReviewResponse> {
        return reviewRepository.findByMatchId(matchId)
            .map { it.toReviewResponse() }
    }

    @Transactional(readOnly = true)
    fun getUserRating(userId: UUID): UserRatingResponse? {
        val userRating = userRatingRepository.findByUserId(userId) ?: return null
        return userRating.toUserRatingResponse()
    }

    @Transactional(readOnly = true)
    fun getUserRatingOrCreate(userId: UUID): UserRatingResponse {
        val userRating = userRatingRepository.findByUserId(userId)
            ?: UserRating(userId = userId).also { userRatingRepository.save(it) }
        return userRating.toUserRatingResponse()
    }

    @Transactional
    fun updateUserRating(userId: UUID) {
        val userRating = userRatingRepository.findByUserId(userId)
            ?: UserRating(userId = userId).also { userRatingRepository.save(it) }

        val reviews = reviewRepository.findByTargetUserId(userId)

        // Считаем рейтинги по типам
        val skillReviews = reviews.filter { it.reviewType == ReviewType.SKILL_LEVEL }
        val behaviorReviews = reviews.filter { it.reviewType == ReviewType.BEHAVIOR }
        val reliabilityReviews = reviews.filter { it.reviewType == ReviewType.RELIABILITY }

        userRating.skillRatingAvg = calculateAverage(skillReviews)
        userRating.skillRatingCount = skillReviews.size.toLong()

        userRating.behaviorRatingAvg = calculateAverage(behaviorReviews)
        userRating.behaviorRatingCount = behaviorReviews.size.toLong()

        userRating.reliabilityRatingAvg = calculateAverage(reliabilityReviews)
        userRating.reliabilityRatingCount = reliabilityReviews.size.toLong()

        // Считаем skill level
        userRating.skillLevelMatches = reviews.count { it.skillLevel == SkillLevel.AS_EXPECTED }.toLong()
        userRating.skillLevelBelow = reviews.count { it.skillLevel == SkillLevel.BELOW_EXPECTED }.toLong()
        userRating.skillLevelAbove = reviews.count { it.skillLevel == SkillLevel.ABOVE_EXPECTED }.toLong()
    }

    @Transactional
    fun deleteReview(reviewId: Long) {
        val review = reviewRepository.findById(reviewId)
            .orElseThrow { NotFoundException.reviewNotFound(reviewId) }

        val targetUserId = review.targetUserId
        reviewRepository.deleteById(reviewId)

        // Пересчитываем рейтинг после удаления
        updateUserRating(targetUserId)
    }

    private fun calculateAverage(reviews: List<Review>): Double {
        if (reviews.isEmpty()) return 0.0
        return reviews.map { it.rating }.average()
    }
}

private fun Review.toReviewResponse(): ReviewResponse {
    return ReviewResponse(
        id = id!!,
        authorId = authorId.toString(),
        targetUserId = targetUserId.toString(),
        matchId = matchId,
        reviewType = reviewType,
        rating = rating,
        skillLevel = skillLevel,
        comment = comment,
        createdAt = createdAt
    )
}

private fun UserRating.toUserRatingResponse(): UserRatingResponse {
    return UserRatingResponse(
        userId = userId.toString(),
        overallRating = getOverallRating(),
        skillRatingAvg = Math.round(skillRatingAvg * 100.0) / 100.0,
        skillRatingCount = skillRatingCount,
        behaviorRatingAvg = Math.round(behaviorRatingAvg * 100.0) / 100.0,
        behaviorRatingCount = behaviorRatingCount,
        reliabilityRatingAvg = Math.round(reliabilityRatingAvg * 100.0) / 100.0,
        reliabilityRatingCount = reliabilityRatingCount,
        skillLevelMatchPercentage = getSkillLevelMatchPercentage(),
        totalReviews = skillRatingCount + behaviorRatingCount + reliabilityRatingCount
    )
}
