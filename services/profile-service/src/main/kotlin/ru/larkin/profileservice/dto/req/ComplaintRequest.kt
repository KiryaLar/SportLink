package ru.larkin.profileservice.dto.req

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import ru.larkin.profileservice.entity.ComplaintType

data class ComplaintRequest(
    @field:Positive(message = "targetProfileId должен быть положительным")
    val targetProfileId: Long,

    val complaintType: ComplaintType,

    @field:NotBlank(message = "Текст жалобы не может быть пустым")
    @field:Size(max = 2000, message = "Текст жалобы не должен превышать 2000 символов")
    val complaintText: String
)
