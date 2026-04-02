//package ru.larkin.ratingservice.entity
//
//import jakarta.persistence.*
//import org.springframework.data.annotation.CreatedDate
//import org.springframework.data.jpa.domain.support.AuditingEntityListener
//import java.time.Instant
//import java.util.UUID
//
//@Entity
//@Table(name = "reviews")
//@EntityListeners(AuditingEntityListener::class)
//class SportsPlaceReview(
//    @Column(nullable = false)
//    val authorId: UUID,
//
//    @Column(nullable = false)
//    val matchId: Long,
//
//    @Column(nullable = false)
//    val sportsPlaceId: Long,
//
//    @Column(nullable = false)
//    var rating: Int,
//
//    var comment: String? = null,
//) {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    var id: Long? = null
//
//    @CreatedDate
//    lateinit var createdAt: Instant
//
//    override fun equals(other: Any?): Boolean {
//        if (this === other) return true
//        if (other !is SportsPlaceReview) return false
//        return id != null && id == other.id
//    }
//
//    override fun hashCode(): Int = id?.hashCode() ?: 0
//}
