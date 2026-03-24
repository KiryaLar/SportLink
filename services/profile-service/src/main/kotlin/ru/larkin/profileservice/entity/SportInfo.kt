package ru.larkin.profileservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant


@Entity
@Table(name = "sport_info")
@EntityListeners(AuditingEntityListener::class)
class SportInfo(
    @Enumerated(EnumType.STRING)
    val sport: Sport,
//    Level from 1 (beginner) to 10 (expert)
    @Column(name = "level", nullable = false)
    var level: Int,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    val profile: Profile,

    @Column(name = "description")
    val description: String? = null
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(name = "events_completed", nullable = false)
    var eventsCompleted: Long = 0
//    @Embedded
//    var rating: SportRating? = SportRating()

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    var updatedAt: Instant? = null
}
