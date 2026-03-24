package ru.larkin.profileservice.exception

open class ProfileServiceException: RuntimeException {

    val errorType: ProfileErrorType?

    constructor(errorType: ProfileErrorType, message: String): super(message) {
        this.errorType = errorType
    }
    constructor(errorType: ProfileErrorType, message: String, cause: Throwable): super(message, cause) {
        this.errorType = errorType
    }
}