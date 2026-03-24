package ru.larkin.matchesservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "match_participants",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_match_participant",
            columnNames = ["match_id", "user_id"]
        )
    ]
)
@EntityListeners(AuditingEntityListener::class)
class MatchParticipant(
    @Column(nullable = false)
    val userId: UUID,

    var playerName: String? = null,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: ParticipantStatus = ParticipantStatus.PENDING
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    var match: Match? = null

    @CreatedDate
    lateinit var joinedAt: Instant

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MatchParticipant) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
