package ru.larkin.gatewayservice.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.web.client.RestClient

@Configuration
class RestClientConfig(
    @Value("\${keycloak.admin-server-url}")
    private val adminServerUrl: String,
) {

    @Bean
    fun restClient(): RestClient {
        var factory = SimpleClientHttpRequestFactory().apply {
            setConnectTimeout(5000)
            setReadTimeout(5000)
        }
        return RestClient.builder()
            .baseUrl(adminServerUrl)
            .requestFactory(factory)
            .build()
    }
}