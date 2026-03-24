package ru.larkin.gatewayservice.security

import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import reactor.core.publisher.Mono

class CustomJwtAuthenticationConverter : Converter<Jwt, Mono<out AbstractAuthenticationToken>> {

    private val jwtGrantedAuthoritiesConverter = JwtGrantedAuthoritiesConverter().apply {
        setAuthorityPrefix("")
        setAuthoritiesClaimName("scope")
    }

    override fun convert(jwt: Jwt): Mono<AbstractAuthenticationToken> {
        val authorities = extractAuthorities(jwt)
        return Mono.just(JwtAuthenticationToken(jwt, authorities, jwt.subject))
    }

    private fun extractAuthorities(jwt: Jwt): Collection<GrantedAuthority> {
        val authorities = jwtGrantedAuthoritiesConverter.convert(jwt)?.toMutableList() ?: mutableListOf()

        // Извлекаем realm roles из токена Keycloak
        val realmAccess = jwt.getClaim<Map<String, List<String>>>("realm_access")
        val roles = realmAccess?.get("roles") ?: emptyList()
        val roleAuthorities = roles.map { role -> SimpleGrantedAuthority("ROLE_$role") }

        authorities.addAll(roleAuthorities)

        return authorities
    }
}