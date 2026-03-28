package ru.larkin.ratingservice.dto.req

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import ru.larkin.ratingservice.entity.ReviewType
import ru.larkin.ratingservice.entity.SkillLevel

data class ReviewCreateRequest(
    @field:NotBlank(message = "targetUserId не может быть пустым")
    val targetUserId: String,

    @field:Positive(message = "matchId должен быть положительным")
    val matchId: Long,

    val reviewType: ReviewType,

    @field:Min(value = 1, message = "rating должен быть от 1")
    @field:Max(value = 5, message = "rating должен быть до 5")
    val rating: Int,

    val skillLevel: SkillLevel? = null,

    @field:Size(max = 2000, message = "Комментарий не должен превышать 2000 символов")
    val comment: String? = null
)
