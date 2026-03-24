package ru.larkin.messagingservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "chat_participants")
class ChatParticipant(
    @Column(nullable = false)
    val userId: UUID
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    var chat: Chat? = null

    @CreatedDate
    lateinit var joinedAt: Instant

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: ParticipantStatus = ParticipantStatus.ACTIVE

    fun leave() {
        status = ParticipantStatus.LEFT
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is ChatParticipant) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
