package ru.larkin.profileservice.storage.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import ru.larkin.profileservice.exception.ImageStorageException
import software.amazon.awssdk.core.exception.SdkClientException
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.model.S3Exception
import java.io.IOException
import java.util.*
import java.util.function.Consumer


@Service
internal class ImageS3Service(
    private val s3Client: S3Client,
    @Value("\${minio.bucket}") private val bucketName: String?,
    @Value("\${minio.url}") private val publicBaseUrl: String?
) : ImageStorageService {
    private val log = LoggerFactory.getLogger(ImageS3Service::class.java)

    override fun uploadProjectImage(projectId: UUID?, imageId: UUID?, image: MultipartFile?): String {
        val objectKey = buildObjectKey(projectId, imageId)
        log.info(
            "Загрузка изображения проекта в S3: projectId={}, imageId={}, objectKey={}, " +
                    "originalFilename={}, size={}, contentType={}",
            projectId, imageId, objectKey, image?.originalFilename, image?.size, image?.contentType
        )

        putImageInStorage(image!!, objectKey)
        log.debug("Загрузка в S3 завершена: objectKey={}", objectKey)
        return objectKey
    }

    //    TODO: UNUSED FOR NOW
    override fun replaceProjectImage(
        projectId: UUID?,
        oldObjectKey: String?,
        image: MultipartFile?,
        newImageId: UUID?
    ): String {
        val newObjectKey = buildObjectKey(projectId, newImageId)
        log.info(
            "Замена изображения проекта в S3: projectId={}, newImageId={}, newObjectKey={}, " +
                    "oldObjectKey={}, originalFilename={}, size={}, contentType={}",
            projectId, newImageId, newObjectKey, oldObjectKey, image?.originalFilename, image?.size, image?.contentType
        )

        putImageInStorage(image!!, newObjectKey)

        if (oldObjectKey != null && !oldObjectKey.isBlank()) {
            deleteImageByKey(oldObjectKey)
        } else {
            log.debug("Старый objectKey не задан — удаление пропущено (oldObjectKey пуст)")
        }

        return newObjectKey
    }

    override fun deleteImageByKey(objectKey: String?) {
        log.info("Удаление изображения из S3: bucketName={}, objectKey={}", bucketName, objectKey)

        try {
            s3Client.deleteObject(Consumer { builder: DeleteObjectRequest.Builder? ->
                builder!!.bucket(bucketName).key(objectKey).build()
            })
            log.debug("Удаление из S3 завершено: objectKey={}", objectKey)
        } catch (e: S3Exception) {
            log.error("Ошибка удаления изображения из S3: bucketName={}, objectKey={}", bucketName, objectKey, e)
            throw ImageStorageException("Couldn't delete image from bucket " + bucketName + ": " + e.message)
        } catch (e: SdkClientException) {
            log.error("Ошибка удаления изображения из S3: bucketName={}, objectKey={}", bucketName, objectKey, e)
            throw ImageStorageException("Couldn't delete image from bucket " + bucketName + ": " + e.message)
        }
    }

    override fun buildPublicUrlByKey(objectKey: String?): String? =
        objectKey?.let {
            val url = "$publicBaseUrl/$bucketName/$objectKey"
            log.debug("Публичная ссылка сформирована: objectKey={}, url={}", objectKey, url)
            return url
        }

    private fun buildObjectKey(projectId: UUID?, imageId: UUID?): String {
        return "$projectId/images/$imageId"
    }

    private fun putImageInStorage(image: MultipartFile, objectKey: String?) {
        val contentType = image.contentType ?: "application/octet-stream"

        val putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .contentType(contentType)
            .key(objectKey)
            .build()

        try {
            val bytes = image.bytes
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes))
        } catch (e: Exception) {
            log.error(
                "Ошибка загрузки изображения в S3: bucketName={}, objectKey={}, originalFilename={}, size={}, contentType={}",
                bucketName, objectKey, image.originalFilename, image.size, contentType, e
            )
            throw ImageStorageException("Couldn't upload image to bucket " + bucketName + ": " + e.message)
        }
    }
}