package ru.larkin.profileservice.entity

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import java.time.Instant

@Embeddable
class PersonRating(
    @Column(name = "rating_avg", nullable = false)
    var avg: Double = 0.0,

    @Column(name = "rating_count", nullable = false)
    var count: Long = 0,

    @Column(name = "rating_version", nullable = false)
    var version: Long = 0,

    @Column(name = "rating_updated_at", nullable = false)
    var updatedAt: Instant = Instant.EPOCH
)
