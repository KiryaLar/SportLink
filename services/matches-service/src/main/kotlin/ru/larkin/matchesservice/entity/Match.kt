package ru.larkin.matchesservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "matches")
@EntityListeners(AuditingEntityListener::class)
class Match(
    @Column(nullable = false)
    val organizerId: UUID,

    @Column(nullable = false)
    var title: String,

    @Column(nullable = false)
    var sport: String,

    @Column(nullable = false)
    var scheduledAt: Instant,

//    TODO: Заменить название и координаты на sportsPlaceId ( и мб подтягивать данные оттуда)
    @Column(nullable = false)
    var sportsPlaceId: Long,

//    @Column(nullable = false)
//    var locationName: String,
//
//    @Column(nullable = false)
//    var latitude: Double,
//
//    @Column(nullable = false)
//    var longitude: Double,

    @Column(nullable = false)
    var maxParticipants: Int,

    @Column(nullable = false)
    var minLevel: Int = 1,

    @Column(nullable = false)
    var maxLevel: Int = 10,

    var description: String? = null,
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: MatchStatus = MatchStatus.OPEN

    @OneToMany(mappedBy = "match", cascade = [CascadeType.ALL], orphanRemoval = true)
    var participants: MutableList<MatchParticipant> = mutableListOf()

    @CreatedDate
    lateinit var createdAt: Instant

    @LastModifiedDate
    lateinit var updatedAt: Instant

    fun addParticipant(participant: MatchParticipant) {
        participants.add(participant)
        participant.match = this
    }

    fun removeParticipant(participant: MatchParticipant) {
        participants.remove(participant)
        participant.match = null
    }

    fun getParticipantCount(): Int = participants.size

    fun hasAvailableSlots(): Boolean = getParticipantCount() < maxParticipants

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Match) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
