package ru.larkin.ratingservice.dto.resp

data class UserRatingResponse(
    val userId: String,
    val overallRating: Double,
    val skillRatingAvg: Double,
    val skillRatingCount: Long,
    val behaviorRatingAvg: Double,
    val behaviorRatingCount: Long,
    val reliabilityRatingAvg: Double,
    val reliabilityRatingCount: Long,
    val skillLevelMatchPercentage: Double,
    val totalReviews: Long
)
