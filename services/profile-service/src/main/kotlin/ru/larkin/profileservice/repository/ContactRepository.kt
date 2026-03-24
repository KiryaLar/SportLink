package ru.larkin.profileservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.profileservice.entity.Contact
import ru.larkin.profileservice.entity.ContactStatus
import java.util.UUID

interface ContactRepository : JpaRepository<Contact, Long> {

    fun findByOwnerId(ownerId: Long): List<Contact>

    fun findByOwnerIdAndStatus(ownerId: Long, status: ContactStatus): List<Contact>

    fun findByContactId(contactId: Long): List<Contact>

    @Query(
        """
        SELECT c FROM Contact c
        WHERE c.owner.id = :ownerId AND c.contact.id = :contactId
        """
    )
    fun findByOwnerIdAndContactId(@Param("ownerId") ownerId: Long, @Param("contactId") contactId: Long): Contact?

    @Query(
        """
        SELECT c FROM Contact c
        WHERE (c.owner.id = :userId AND c.contact.id = :targetId)
           OR (c.owner.id = :targetId AND c.contact.id = :userId)
        """
    )
    fun findContactBetweenUsers(@Param("userId") userId: Long, @Param("targetId") targetId: Long): Contact?

    fun existsByOwnerIdAndContactId(ownerId: Long, contactId: Long): Boolean

    fun deleteByOwnerIdAndContactId(ownerId: Long, contactId: Long)

    fun deleteByOwnerId(ownerId: Long)

    fun deleteByContactId(contactId: Long)
}
