package ru.larkin.notificationservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener::class)
class Notification(
    @Column(nullable = false)
    val userId: UUID,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val type: NotificationType,

    @Column(nullable = false)
    var title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var message: String,

    @Column(name = "entity_id")
    var entityId: Long? = null,

    @Column(name = "entity_type")
    var entityType: String? = null,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: NotificationStatus = NotificationStatus.PENDING,

    var data: String? = null // JSON data for additional info
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @CreatedDate
    lateinit var createdAt: Instant

    fun markAsRead() {
        status = NotificationStatus.READ
    }

    fun markAsDelivered() {
        status = NotificationStatus.DELIVERED
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Notification) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
