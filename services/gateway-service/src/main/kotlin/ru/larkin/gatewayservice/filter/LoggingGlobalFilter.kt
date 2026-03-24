package ru.larkin.gatewayservice.filter

import org.slf4j.LoggerFactory
import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.core.Ordered
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Component
class LoggingGlobalFilter : GlobalFilter, Ordered {

    private val log = LoggerFactory.getLogger(LoggingGlobalFilter::class.java)

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        val request = exchange.request
        val response = exchange.response

        log.info(
            "Incoming request: {} {} | Headers: {}",
            request.method,
            request.path,
            filterSensitiveHeaders(request.headers)
        )

        return chain.filter(exchange).doOnSuccess {
            log.info(
                "Response status: {} for {} {}",
                response.statusCode,
                request.method,
                request.path
            )
        }
    }

    override fun getOrder(): Int = Ordered.HIGHEST_PRECEDENCE

    private fun filterSensitiveHeaders(headers: HttpHeaders): Map<String, List<String>> {
        val sensitiveHeaders = setOf(
            HttpHeaders.AUTHORIZATION,
            HttpHeaders.COOKIE,
            "X-Api-Key"
        )
        return headers.headerNames()
            .asSequence()
            .filterNot { name -> name in sensitiveHeaders }
            .associateWith { name -> headers.get(name).orEmpty() }
    }
}
