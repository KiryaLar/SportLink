//package ru.larkin.gatewayservice.security
//
//import com.fasterxml.jackson.databind.ObjectMapper
//import org.springframework.http.HttpStatus
//import org.springframework.http.MediaType
//import org.springframework.security.core.AuthenticationException
//import org.springframework.security.web.server.ServerAuthenticationEntryPoint
//import org.springframework.web.server.ServerWebExchange
//import reactor.core.publisher.Mono
//import java.time.Instant
//
//class CustomAuthenticationEntryPoint : ServerAuthenticationEntryPoint{
//    private val objectMapper = ObjectMapper()
//
//    override fun commence(
//        exchange: ServerWebExchange,
//        ex: AuthenticationException
//    ): Mono<Void> {
//        val response = exchange.response
//        response.statusCode = HttpStatus.UNAUTHORIZED
//        response.headers.contentType = MediaType.APPLICATION_JSON
//
//        val errorResponse = mapOf(
//            "timestamp" to Instant.now().toString(),
//            "status" to HttpStatus.UNAUTHORIZED.value(),
//            "error" to "Unauthorized",
//            "message" to "Invalid or missing authentication token",
//            "path" to exchange.request.path.toString()
//        )
//
//        return response.writeWith(
//            Mono.just(
//                response.bufferFactory().wrap(
//                    objectMapper.writeValueAsBytes(errorResponse)
//                )
//            )
//        )
//    }
//
//}