package ru.larkin.profileservice.exception

class ImageStorageException : ProfileServiceException {
    constructor(message: String) : super(ProfileErrorType.IMAGE_STORAGE, message)
    constructor(message: String, cause: Throwable) : super(
        ProfileErrorType.IMAGE_STORAGE,
        message,
        cause
    )
}