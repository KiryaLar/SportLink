package ru.larkin.profileservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant

@Entity
@Table(name = "complaints")
@EntityListeners(AuditingEntityListener::class)
class Complaint(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_profile_id", nullable = false)
    val reporterProfile: Profile,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_profile_id", nullable = false)
    val targetProfile: Profile,

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