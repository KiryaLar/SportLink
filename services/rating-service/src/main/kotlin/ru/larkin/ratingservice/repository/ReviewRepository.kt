package ru.larkin.ratingservice.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.ratingservice.entity.ReviewType
import ru.larkin.ratingservice.entity.TechnicalReview
import java.util.UUID

interface ReviewRepository : JpaRepository<TechnicalReview, Long> {

    fun findByTargetUserId(targetUserId: UUID): List<TechnicalReview>

    fun findByTargetUserIdOrderByCreatedAtDesc(targetUserId: UUID, pageable: Pageable): Page<TechnicalReview>

    fun findByAuthorId(authorId: UUID): List<TechnicalReview>

    fun findByMatchId(matchId: Long): List<TechnicalReview>

    @Query(
        """
        SELECT r FROM TechnicalReview r
        WHERE r.targetUserId = :userId AND r.reviewType = :reviewType
        ORDER BY r.createdAt DESC
        """
    )
    fun findByUserIdAndType(
        @Param("userId") userId: UUID,
        @Param("reviewType") reviewType: ReviewType,
        pageable: Pageable
    ): Page<TechnicalReview>

    fun countByTargetUserId(targetUserId: UUID): Long

    fun countByTargetUserIdAndReviewType(targetUserId: UUID, reviewType: ReviewType): Long

    fun existsByAuthorIdAndTargetUserIdAndMatchId(
        authorId: UUID,
        targetUserId: UUID,
        matchId: Long
    ): Boolean
}
