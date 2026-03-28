package ru.larkin.messagingservice.dto.req

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class MessageCreateRequest(
    @field:NotBlank(message = "content не может быть пустым")
    @field:Size(max = 5000, message = "content не должен превышать 5000 символов")
    val content: String
)
