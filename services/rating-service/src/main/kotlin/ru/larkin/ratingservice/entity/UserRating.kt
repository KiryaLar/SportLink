package ru.larkin.ratingservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_ratings")
@EntityListeners(AuditingEntityListener::class)
class UserRating(
    @Column(nullable = false, unique = true)
    val userId: UUID
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(name = "skill_rating_avg", nullable = false)
    var skillRatingAvg: Double = 0.0

    @Column(name = "skill_rating_count", nullable = false)
    var skillRatingCount: Long = 0

    @Column(name = "behavior_rating_avg", nullable = false)
    var behaviorRatingAvg: Double = 0.0

    @Column(name = "behavior_rating_count", nullable = false)
    var behaviorRatingCount: Long = 0

    @Column(name = "reliability_rating_avg", nullable = false)
    var reliabilityRatingAvg: Double = 0.0

    @Column(name = "reliability_rating_count", nullable = false)
    var reliabilityRatingCount: Long = 0

    @Column(name = "skill_level_matches", nullable = false)
    var skillLevelMatches: Long = 0

    @Column(name = "skill_level_below", nullable = false)
    var skillLevelBelow: Long = 0

    @Column(name = "skill_level_above", nullable = false)
    var skillLevelAbove: Long = 0

    @LastModifiedDate
    var updatedAt: Instant? = null

    fun getOverallRating(): Double {
        val totalAvg = (skillRatingAvg + behaviorRatingAvg + reliabilityRatingAvg) / 3
        return Math.round(totalAvg * 100.0) / 100.0
    }

    fun getSkillLevelMatchPercentage(): Double {
        val total = skillLevelMatches + skillLevelBelow + skillLevelAbove
        if (total == 0L) return 100.0
        return Math.round((skillLevelMatches.toDouble() / total) * 10000.0) / 100.0
    }
}
