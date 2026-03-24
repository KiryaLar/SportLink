package ru.larkin.ratingservice.dto.req

import ru.larkin.ratingservice.entity.ReviewType
import ru.larkin.ratingservice.entity.SkillLevel

data class ReviewCreateRequest(
    val targetUserId: String,
    val matchId: Long,
    val reviewType: ReviewType,
    val rating: Int,
    val skillLevel: SkillLevel? = null,
    val comment: String? = null
)
