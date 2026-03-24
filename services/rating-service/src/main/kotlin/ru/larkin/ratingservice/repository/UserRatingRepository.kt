package ru.larkin.ratingservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import ru.larkin.ratingservice.entity.UserRating
import java.util.UUID

interface UserRatingRepository : JpaRepository<UserRating, Long> {

    fun findByUserId(userId: UUID): UserRating?

    fun existsByUserId(userId: UUID): Boolean

    fun deleteByUserId(userId: UUID)
}
