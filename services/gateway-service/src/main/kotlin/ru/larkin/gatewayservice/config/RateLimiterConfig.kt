package ru.larkin.gatewayservice.config

import org.springframework.cloud.gateway.filter.ratelimit.RateLimiter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RateLimiterConfig {

//    TODO: RL
//    @Bean
//    fun rateLimiter(): RequestRateLimiter {
//        val config = io.github.resilience4j.ratelimiter.RateLimiterConfig.custom()
//            .limitForPeriod(100) // Максимальное количество запросов в период
//            .limitRefreshPeriod(java.time.Duration.ofSeconds(1)) // Период обновления лимита
//            .timeoutDuration(java.time.Duration.ofMillis(500)) // Время ожидания при превышении лимита
//            .build()
//        return io.github.resilience4j.ratelimiter.RateLimiter.of("gatewayRateLimiter", config)
//    }
}