package ru.larkin.profileservice.exception

import java.util.UUID

class NotFoundException: ProfileServiceException {
    private constructor(message: String) : super(ProfileErrorType.NOT_FOUND, message)
    private constructor(message: String, cause: Throwable) : super(ProfileErrorType.NOT_FOUND, message, cause)

    companion object {
        fun profileNotFound(profileId: Long): NotFoundException {
            return NotFoundException("Profile with id $profileId not found")
        }
        fun profileNotFound(profileId: Long, cause: Throwable): NotFoundException {
            return NotFoundException("Profile with id $profileId not found", cause)
        }

        fun userNotFound(userId: UUID): NotFoundException {
            return NotFoundException("User with id $userId not found")
        }
        fun userNotFound(userId: UUID, cause: Throwable): NotFoundException {
            return NotFoundException("User with id $userId not found", cause)
        }

        fun complainNotFound(complainId: Long): NotFoundException {
            return NotFoundException("Complain with id $complainId not found")
        }
        fun complainNotFound(complainId: Long, cause: Throwable): NotFoundException {
            return NotFoundException("Complain with id $complainId not found", cause)
        }

        fun contactNotFound(contactId: Long): NotFoundException {
            return NotFoundException("Contact with id $contactId not found")
        }
    }
}