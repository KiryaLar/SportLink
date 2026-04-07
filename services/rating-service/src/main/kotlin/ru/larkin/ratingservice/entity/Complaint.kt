package ru.larkin.ratingservice.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "complaints")
@EntityListeners(AuditingEntityListener::class)
class Complaint(
    @Column(nullable = false)
    val authorId: UUID,

    @Column(nullable = false)
    val targetUserId: UUID,

    @Column(name = "complaint_type", nullable = false)
    @Enumerated(EnumType.STRING)
    val complaintType: ComplaintType,

    @Column(nullable = false)
    val complaintText: String,
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @CreatedDate
    lateinit var createdAt: Instant

    @Column(name = "reviewed_at")
    var reviewedAt: Instant? = null

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: ComplaintStatus = ComplaintStatus.PENDING
}