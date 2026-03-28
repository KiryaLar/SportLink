package ru.larkin.profileservice.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.profileservice.dto.resp.ContactResponse
import ru.larkin.profileservice.dto.resp.ContactStatusResponse
import ru.larkin.profileservice.dto.resp.ProfileSummaryResponse
import ru.larkin.profileservice.entity.Contact
import ru.larkin.profileservice.entity.ContactStatus
import ru.larkin.profileservice.exception.NotFoundException
import ru.larkin.profileservice.exception.ProfileErrorType
import ru.larkin.profileservice.exception.ProfileServiceException
import ru.larkin.profileservice.repository.ContactRepository
import ru.larkin.profileservice.repository.ProfileRepository
import ru.larkin.profileservice.storage.service.ImageStorageService
import ru.larkin.profileservice.utils.toProfileSummaryResponse
import java.util.UUID

@Service
class ContactService(
    private val contactRepository: ContactRepository,
    private val profileRepository: ProfileRepository,
    private val imageStorageService: ImageStorageService
) {

    @Transactional(readOnly = true)
    fun getContactsByUserId(userId: UUID): List<ProfileSummaryResponse> {
        val profile = profileRepository.findByKeycloakUserId(userId)
            ?: throw NotFoundException.userNotFound(userId)

        return contactRepository.findByOwnerIdAndStatus(profile.id!!, ContactStatus.ACCEPTED)
            .map { it.contact.toProfileSummaryResponse(imageStorageService::buildPublicUrlByKey) }        
    }

    @Transactional
    fun sendContactRequest(userId: UUID, targetProfileId: Long): ContactResponse {
        val ownerProfile = profileRepository.findByKeycloakUserId(userId)
            ?: throw NotFoundException.userNotFound(userId)

        val targetProfile = profileRepository.findById(targetProfileId)
            .orElseThrow { NotFoundException.profileNotFound(targetProfileId) }

        if (ownerProfile.id == targetProfileId) {
            throw ProfileServiceException(ProfileErrorType.VALIDATION, "Cannot add yourself to contacts")
        }

        val existingContact = contactRepository.findContactBetweenUsers(ownerProfile.id!!, targetProfileId)
        if (existingContact != null) {
            throw ProfileServiceException(ProfileErrorType.VALIDATION, "Contact already exists")
        }

        val contact = Contact(
            owner = ownerProfile,
            contact = targetProfile,
            status = ContactStatus.PENDING
        )

        val savedContact = contactRepository.save(contact)
        return savedContact.toContactResponse(imageStorageService::buildPublicUrlByKey)
    }

    @Transactional
    fun updateContactStatus(userId: UUID, contactId: Long, status: String): ContactResponse {
        val profile = profileRepository.findByKeycloakUserId(userId)
            ?: throw NotFoundException.userNotFound(userId)

        val contact = contactRepository.findById(contactId)
            .orElseThrow { NotFoundException.contactNotFound(contactId) }

        if (contact.owner.id != profile.id) {
            throw ProfileServiceException(ProfileErrorType.ACCESS_DENIED, "No rights to update this contact")
        }

        contact.status = ContactStatus.valueOf(status)

        val savedContact = contactRepository.save(contact)
        return savedContact.toContactResponse(imageStorageService::buildPublicUrlByKey)
    }

    @Transactional
    fun removeContact(userId: UUID, contactId: Long) {
        val profile = profileRepository.findByKeycloakUserId(userId)
            ?: throw NotFoundException.userNotFound(userId)

        val contact = contactRepository.findById(contactId)
            .orElseThrow { NotFoundException.contactNotFound(contactId) }

        if (contact.owner.id != profile.id && contact.contact.id != profile.id) {
            throw ProfileServiceException(ProfileErrorType.ACCESS_DENIED, "No rights to remove this contact")
        }

        contactRepository.delete(contact)
    }
}

private fun Contact.toContactResponse(avatarUrlBuilder: (String?) -> String?): ContactResponse {
    return ContactResponse(
        id = id!!,
        contact = contact.toProfileSummaryResponse(avatarUrlBuilder),
        status = when (status) {
            ContactStatus.PENDING -> ContactStatusResponse.PENDING
            ContactStatus.ACCEPTED -> ContactStatusResponse.ACCEPTED
            ContactStatus.BLOCKED -> ContactStatusResponse.BLOCKED
            else -> ContactStatusResponse.PENDING
        }
    )
}
