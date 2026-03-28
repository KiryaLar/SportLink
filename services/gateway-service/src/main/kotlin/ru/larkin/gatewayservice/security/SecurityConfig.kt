package ru.larkin.gatewayservice.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.web.server.SecurityWebFilterChain
import org.springframework.security.web.server.ServerAuthenticationEntryPoint
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository
import org.springframework.security.web.server.savedrequest.NoOpServerRequestCache
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.CorsConfigurationSource
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource
import reactor.core.publisher.Mono

@Configuration
@EnableWebFluxSecurity
class SecurityConfig {

    @Bean
    fun securityFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        return http
            .csrf { it.disable() }
//            TODO: CORS - настроить для фронтенда
            .cors { it.configurationSource(corsConfigurationSource()) }
            .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
            .requestCache { it.requestCache(NoOpServerRequestCache.getInstance()) }
            .authorizeExchange { exchanges ->
                exchanges
                    .pathMatchers(
                        "/api/v1/auth/**"
                    ).permitAll()
                    .pathMatchers(
                        "/actuator/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/api-docs/**"
                    ).permitAll()
                    .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .pathMatchers("/api/v1/**").authenticated()
                    .anyExchange().authenticated()
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(CustomJwtAuthenticationConverter())
                }
                    .authenticationEntryPoint(entryPoint())
                    .accessDeniedHandler(accessDeniedHandler())
            }
            .build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOrigins = listOf("http://localhost:3000", "http://localhost:*")
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("Authorization", "Content-Type", "X-Requested-With")
            exposedHeaders = listOf("Location")
            allowCredentials = true
            maxAge = 3600
        }

        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", config)
        }
    }

    @Bean
    fun entryPoint(): ServerAuthenticationEntryPoint = ServerAuthenticationEntryPoint { exchange, _ ->
        exchange.response.statusCode = HttpStatus.UNAUTHORIZED
        exchange.response.headers.contentType = MediaType.APPLICATION_JSON
        val bytes = """{"error":"unauthorized","message":"Требуется аутентификация"}""".toByteArray()
        exchange.response.writeWith(Mono.just(exchange.response.bufferFactory().wrap(bytes)))
    }

    @Bean
    fun accessDeniedHandler(): ServerAccessDeniedHandler = ServerAccessDeniedHandler { exchange, _ ->
        exchange.response.statusCode = HttpStatus.FORBIDDEN
        exchange.response.headers.contentType = MediaType.APPLICATION_JSON
        val bytes = """{"error":"forbidden","message":"Недостаточно прав"}""".toByteArray()
        exchange.response.writeWith(Mono.just(exchange.response.bufferFactory().wrap(bytes)))
    }
}
