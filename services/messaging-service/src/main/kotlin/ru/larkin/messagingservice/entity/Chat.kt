package ru.larkin.messagingservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "chats")
@EntityListeners(AuditingEntityListener::class)
class Chat(
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val chatType: ChatType,

    var name: String? = null,

    @Column(name = "match_id")
    var matchId: Long? = null
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @CreatedDate
    lateinit var createdAt: Instant

    @LastModifiedDate
    lateinit var updatedAt: Instant

    @OneToMany(mappedBy = "chat", cascade = [CascadeType.ALL], orphanRemoval = true)
    var messages: MutableList<Message> = mutableListOf()

    @OneToMany(mappedBy = "chat", cascade = [CascadeType.ALL], orphanRemoval = true)
    var participants: MutableList<ChatParticipant> = mutableListOf()

    fun addParticipant(userId: UUID): ChatParticipant {
        val participant = ChatParticipant(userId = userId)
        participant.chat = this
        participants.add(participant)
        return participant
    }

    fun removeParticipant(userId: UUID) {
        participants.removeAll { it.userId == userId }
    }

    fun isParticipant(userId: UUID): Boolean = participants.any { it.userId == userId }

    fun getActiveParticipants(): List<UUID> = participants
        .filter { it.status == ParticipantStatus.ACTIVE }
        .map { it.userId }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Chat) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
