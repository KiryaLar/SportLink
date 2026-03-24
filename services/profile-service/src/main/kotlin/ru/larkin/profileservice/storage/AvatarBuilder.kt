package ru.larkin.profileservice.storage

import org.springframework.stereotype.Component
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Component
class AvatarBuilder(private val props: StorageProperties) {

    fun buildUrl(key: String?): String? {
        if (key.isNullOrBlank()) return null
        val encodedKey = URLEncoder.encode(key, StandardCharsets.UTF_8)
            .replace("+", "%20")
        return "${props.baseUrl.trimEnd('/')}/${encodedKey}"
    }
}
