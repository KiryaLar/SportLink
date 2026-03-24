package ru.larkin.profileservice.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.profileservice.entity.Complaint
import ru.larkin.profileservice.entity.ComplaintStatus

interface ComplaintRepository : JpaRepository<Complaint, Long> {

    fun findByTargetProfileId(targetProfileId: Long): List<Complaint>

    fun findByTargetProfileIdAndStatus(targetProfileId: Long, status: ComplaintStatus): List<Complaint>

    fun findByReporterProfileId(reporterProfileId: Long): List<Complaint>

    @Query(
        """
        SELECT c FROM Complaint c
        WHERE c.status = :status
        ORDER BY c.createdAt DESC
        """
    )
    fun findByStatus(@Param("status") status: ComplaintStatus, pageable: Pageable): Page<Complaint>

    fun countByTargetProfileIdAndStatus(targetProfileId: Long, status: ComplaintStatus): Long
}
