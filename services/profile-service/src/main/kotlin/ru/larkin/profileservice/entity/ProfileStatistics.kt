package ru.larkin.profileservice.entity

import jakarta.persistence.*

@Entity
@Table(name = "profile_statistics")
class ProfileStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    var complaintCount: Int = 0

}