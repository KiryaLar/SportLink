package ru.larkin.ratingservice.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.ratingservice.entity.Review
import ru.larkin.ratingservice.entity.ReviewType
import java.util.UUID

interface ReviewRepository : JpaRepository<Review, Long> {

    fun findByTargetUserId(targetUserId: UUID): List<Review>

    fun findByTargetUserIdOrderByCreatedAtDesc(targetUserId: UUID, pageable: Pageable): Page<Review>

    fun findByAuthorId(authorId: UUID): List<Review>

    fun findByMatchId(matchId: Long): List<Review>

    @Query(
        """
        SELECT r FROM Review r
        WHERE r.targetUserId = :userId AND r.reviewType = :reviewType
        ORDER BY r.createdAt DESC
        """
    )
    fun findByUserIdAndType(
        @Param("userId") userId: UUID,
        @Param("reviewType") reviewType: ReviewType,
        pageable: Pageable
    ): Page<Review>

    fun countByTargetUserId(targetUserId: UUID): Long

    fun countByTargetUserIdAndReviewType(targetUserId: UUID, reviewType: ReviewType): Long

    fun existsByAuthorIdAndTargetUserIdAndMatchId(
        authorId: UUID,
        targetUserId: UUID,
        matchId: Long
    ): Boolean
}
