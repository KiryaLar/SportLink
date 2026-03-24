package ru.larkin.profileservice.storage.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.http.apache.ApacheHttpClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.net.URI

@Configuration
class StorageConfig(
    @Value("\${minio.url}")
    private val url: String,

    @Value("\${minio.region}")
    private val region: String,

    @Value("\${minio.access-key}")
    private val accessKey: String,

    @Value("\${minio.secret-key}")
    private val secretKey: String,
) {

    @Bean
    fun s3Client(): S3Client {
        val credentials: AwsCredentials = AwsBasicCredentials.create(accessKey, secretKey)

        return S3Client.builder()
            .httpClient(ApacheHttpClient.create())
            .endpointOverride(URI.create(url))
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .forcePathStyle(true)
            .build()
    }
}
