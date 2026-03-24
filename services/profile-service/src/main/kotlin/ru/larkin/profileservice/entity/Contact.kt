package ru.larkin.profileservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant

@Entity
@Table(
    name = "profile_contacts",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_profile_contacts_pair",
            columnNames = ["owner_id", "contact_id"]
        )
    ]
)
@EntityListeners(AuditingEntityListener::class)
class Contact(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    var owner: Profile,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    var contact: Profile,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ContactStatus? = ContactStatus.PENDING
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(nullable = false)
    @CreatedDate
    lateinit var createdAt: Instant

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Contact) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: System.identityHashCode(this)
}