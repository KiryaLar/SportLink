package ru.larkin.profileservice.storage.service

import org.springframework.web.multipart.MultipartFile
import java.util.*

interface ImageStorageService {
    fun uploadProjectImage(projectId: UUID?, uuid: UUID?, image: MultipartFile?): String?

    fun deleteImageByKey(objectKey: String?)

    fun replaceProjectImage(projectId: UUID?, oldObjectKey: String?, image: MultipartFile?, newImageId: UUID?): String?

    fun buildPublicUrlByKey(objectKey: String?): String?
}
