package ru.larkin.profileservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "profiles")
@EntityListeners(AuditingEntityListener::class)
class Profile(
    @Column(nullable = false)
    val keycloakUserId: UUID? = null,

    @Column(nullable = false)
    var email: String,
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    var name: String? = null

    var phone: String? = null

    var city: String? = null

//    TODO: age нельзя менять
    var age: Int? = null

    var avatarKey: String? = null

    @Column(nullable = false)
    var status: ProfileStatus = ProfileStatus.ACTIVE

    var description: String? = null

    @OneToMany(cascade = [CascadeType.ALL])
    var sports: MutableList<SportInfo> = mutableListOf()

    @OneToMany(cascade = [CascadeType.ALL])
    var outgoingContacts: MutableSet<Contact> = mutableSetOf()

    var complaintCount: Int = 0

    @get:Transient
    val contactProfiles: List<Profile>
        get() = outgoingContacts
            .filter { it.status == ContactStatus.ACCEPTED }
            .map { it.contact }

    @Embedded
    var rating: PersonRating = PersonRating()

    @CreatedDate
    lateinit var createdAt: Instant

    @LastModifiedDate
    lateinit var updatedAt: Instant

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Profile) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}