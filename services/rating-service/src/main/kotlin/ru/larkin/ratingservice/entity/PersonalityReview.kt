package ru.larkin.ratingservice.entity

import jakarta.persistence.Entity
import jakarta.persistence.Id

@Entity
class PersonalityReview(
    var personalityReviewType: PersonalityReviewType,
) {
    @Id
    var id: Long? = null
}