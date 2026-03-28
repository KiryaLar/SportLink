package ru.larkin.profileservice.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableMethodSecurity
class SecurityConfig {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { it.disable() }
            .cors { }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // Actuator и документация
                    .requestMatchers(
                        "/actuator/**",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html"
                    ).permitAll()
                    // Preflight requests
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // Все API требуют аутентификации
                    .anyRequest().authenticated()
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(keycloakJwtAuthConverter())
                }
            }
            .build()
    }

    @Bean
    fun keycloakJwtAuthConverter(): Converter<Jwt, out AbstractAuthenticationToken> {
        val scopesConverter = JwtGrantedAuthoritiesConverter().apply {
            setAuthorityPrefix("SCOPE_")
        }

        return object : Converter<Jwt, AbstractAuthenticationToken> {
            override fun convert(jwt: Jwt): AbstractAuthenticationToken {
                val authorities = mutableSetOf<GrantedAuthority>()

                authorities += scopesConverter.convert(jwt).orEmpty()

                val realmRoles =
                    (jwt.claims["realm_access"] as? Map<*, *>)?.get("roles") as? Collection<*>
                realmRoles.orEmpty().forEach { role ->
                    authorities += SimpleGrantedAuthority("ROLE_${role.toString()}")
                }

                return JwtAuthenticationToken(jwt, authorities, jwt.subject)
            }
        }
    }
}
