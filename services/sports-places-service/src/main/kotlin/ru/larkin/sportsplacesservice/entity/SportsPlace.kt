package ru.larkin.sportsplacesservice.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "sports_places")
@EntityListeners(AuditingEntityListener::class)
class SportsPlace(
    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var description: String? = null,

    @Column(nullable = false)
    var address: String,

    @Column(nullable = false)
    var latitude: Double,

    @Column(nullable = false)
    var longitude: Double,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var placeType: SportsPlaceType = SportsPlaceType.FREE,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: SportsPlaceStatus = SportsPlaceStatus.PENDING,

    var priceInfo: String? = null,

    var workingHours: String? = null,

    var contactInfo: String? = null,

    @ElementCollection
    @CollectionTable(name = "sports_places_sports", joinColumns = [JoinColumn(name = "place_id")])
    @Column(name = "sport")
    var supportedSports: MutableList<String> = mutableListOf(),

    var imageUrl: String? = null,

    var createdBy: UUID? = null
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @CreatedDate
    lateinit var createdAt: Instant

    @LastModifiedDate
    lateinit var updatedAt: Instant

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is SportsPlace) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
