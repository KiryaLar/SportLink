package ru.larkin.ratingservice.dto.resp

import ru.larkin.ratingservice.entity.ReviewType
import ru.larkin.ratingservice.entity.SkillLevel
import java.time.Instant

data class ReviewResponse(
    val id: Long,
    val authorId: String,
    val targetUserId: String,
    val matchId: Long,
    val reviewType: ReviewType,
    val rating: Int,
    val skillLevel: SkillLevel?,
    val comment: String?,
    val createdAt: Instant
)
