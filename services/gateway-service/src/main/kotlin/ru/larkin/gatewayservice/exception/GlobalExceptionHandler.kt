package ru.larkin.gatewayservice.exception

import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
import org.springframework.core.Ordered
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.InsufficientAuthenticationException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.bind.support.WebExchangeBindException
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.server.ServerWebInputException
import java.net.URI
import java.time.Instant

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
class GlobalExceptionHandler {
    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(WebExchangeBindException::class)
    fun handleWebExchangeBind(ex: WebExchangeBindException, request: ServerHttpRequest): ResponseEntity<ProblemDetail> {
        val violations = ex.bindingResult.fieldErrors.map { error ->
            mapOf(
                "field" to error.field,
                "message" to (error.defaultMessage ?: ""),
                "rejectedValue" to (error.rejectedValue?.toString() ?: "")
            )
        }
        log.warn("Validation failed: {} -> {} violation(s): {}", request.path.value(), violations.size, violations)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Ошибка валидации")
        problem.title = "Validation error"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        problem.setProperty("violations", violations)
        return ResponseEntity(problem, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(ServerWebInputException::class)
    fun handleWebInput(ex: ServerWebInputException, request: ServerHttpRequest): ResponseEntity<ProblemDetail> {
        val reason = ex.reason ?: ex.message
        log.warn("Bad request [{}]: {}", request.path.value(), reason)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, reason ?: "Bad request")
        problem.title = "Bad Request"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatus(ex: ResponseStatusException, request: ServerHttpRequest): ResponseEntity<ProblemDetail> {
        val status = HttpStatus.resolve(ex.statusCode.value()) ?: HttpStatus.INTERNAL_SERVER_ERROR
        if (status.is5xxServerError) {
            log.error("ResponseStatusException: {}", ex.message, ex)
        } else {
            log.warn("ResponseStatusException: {}", ex.message)
        }

        val detail = ex.reason?.takeIf { it.isNotBlank() } ?: ex.message

        val problem = ProblemDetail.forStatusAndDetail(status, detail)
        problem.title = status.reasonPhrase
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, status)
    }

    @ExceptionHandler(KeycloakAuthenticationException::class)
    fun handleKeycloakAuth(ex: KeycloakAuthenticationException, request: ServerHttpRequest): ResponseEntity<ProblemDetail> {
        log.warn("Authentication failed: {} -> {}", request.path.value(), ex.message)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.message ?: "Authentication failed")
        problem.title = "Authentication failed"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(UserAlreadyExistsException::class)
    fun handleUserAlreadyExists(ex: UserAlreadyExistsException, request: ServerHttpRequest): ResponseEntity<ProblemDetail> {
        log.warn("User already exists: {}", ex.message)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.message ?: "User already exists")
        problem.title = "Conflict"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.CONFLICT)
    }

    @ExceptionHandler(GatewayException::class)
    fun handleGatewayException(ex: GatewayException, request: ServerHttpRequest): ResponseEntity<ProblemDetail> {
        log.warn("Gateway error: {}", ex.message)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.message ?: "Gateway error")
        problem.title = "Gateway Error"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(
        ex: BadCredentialsException,
        request: ServerHttpRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Bad credentials: {} -> {}", request.path.value(), ex.message)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Неверные учетные данные")
        problem.title = "Authentication failed"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(InsufficientAuthenticationException::class)
    fun handleInsufficientAuth(
        ex: InsufficientAuthenticationException,
        request: ServerHttpRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Authentication required: {} -> {}", request.path.value(), ex.message)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Требуется аутентификация")
        problem.title = "Authentication required"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(
        ex: AccessDeniedException,
        request: ServerHttpRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Access denied: {} -> {}", request.path.value(), ex.message)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Доступ запрещен")
        problem.title = "Access denied"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.FORBIDDEN)
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: ConstraintViolationException,
        request: ServerHttpRequest
    ): ResponseEntity<ProblemDetail> {
        val violations = ex.constraintViolations
            .map { v ->
                mapOf(
                    "property" to (v.propertyPath?.toString() ?: ""),
                    "message" to (v.message ?: ""),
                    "invalidValue" to (v.invalidValue?.toString() ?: "")
                )
            }

        log.warn(
            "Validation failed: {} -> {} violation(s)",
            request.path.value(),
            violations.size,
        )

        val problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            "Ошибка валидации"
        )
        problem.title = "Validation error"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        problem.setProperty("violations", violations)

        return ResponseEntity(problem, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception, request: ServerHttpRequest): ResponseEntity<ProblemDetail> {
        log.error("Unexpected error: {}", ex.message, ex)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Внутренняя ошибка сервера")
        problem.title = "Internal Server Error"
        problem.instance = URI.create(request.path.value())
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
