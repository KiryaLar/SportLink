package ru.larkin.profileservice.exception

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.ConstraintViolation
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.InsufficientAuthenticationException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import ru.larkin.profileservice.storage.service.ImageS3Service
import java.time.Instant
import java.util.function.Consumer

@RestControllerAdvice
class GlobalExceptionHandler {
    private val log = LoggerFactory.getLogger(ImageS3Service::class.java)

    private fun baseProblem(
        status: HttpStatus,
        title: String?,
        detail: String?,
        request: HttpServletRequest
    ): ProblemDetail {
        val problem = ProblemDetail.forStatusAndDetail(status, detail)
        problem.title = title
        problem.setProperty("timestamp", Instant.now())
        problem.setProperty("path", request.requestURI)
        return problem
    }

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(
        ex: NotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("NotFound: {} {} -> {}", request.method, request.requestURI, ex.message)
        val problem = baseProblem(
            HttpStatus.NOT_FOUND,
            "Resource not found",
            ex.message,
            request
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValid(
        ex: MethodArgumentNotValidException,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        val errors: MutableMap<String?, String?> = HashMap<String?, String?>()
        for (fieldError in ex.bindingResult.fieldErrors) {
            errors.putIfAbsent(fieldError.field, fieldError.defaultMessage)
        }

        log.warn("Validation failed: {} {} -> {}", request.method, request.requestURI, errors)

        val problem = baseProblem(
            HttpStatus.BAD_REQUEST,
            "Validation failed",
            "Request body validation failed",
            request
        )
        problem.setProperty("errors", errors)

        return ResponseEntity.badRequest().body(problem)
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: ConstraintViolationException,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        val errors: MutableMap<String?, String?> = HashMap<String?, String?>()
        ex.constraintViolations.forEach(Consumer { violation: ConstraintViolation<*>? ->
            val path: String? = violation!!.propertyPath.toString()
            errors.putIfAbsent(path, violation.message)
        })

        log.warn("Constraint violation: {} {} -> {}", request.method, request.requestURI, errors)

        val problem = baseProblem(
            HttpStatus.BAD_REQUEST,
            "Constraint violation",
            "Request parameters validation failed",
            request
        )
        problem.setProperty("errors", errors)

        return ResponseEntity.badRequest().body(problem)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleNotReadable(
        ex: HttpMessageNotReadableException,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Malformed JSON: {} {}", request.method, request.requestURI, ex)
        val problem = baseProblem(
            HttpStatus.BAD_REQUEST,
            "Malformed JSON request",
            ex.message,
            request
        )
        return ResponseEntity.badRequest().body(problem)
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleTypeMismatch(
        ex: MethodArgumentTypeMismatchException,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        val detail = "Parameter '${ex.name}' has invalid value '${ex.value}'"

        log.warn("Argument type mismatch: {} {} -> {}", request.method, request.requestURI, detail)

        val problem = baseProblem(
            HttpStatus.BAD_REQUEST,
            "Argument type mismatch",
            detail,
            request
        )
        return ResponseEntity.badRequest().body(problem)
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    fun handleMethodNotSupported(
        ex: HttpRequestMethodNotSupportedException,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Method not allowed: {} {} -> {}", request.method, request.requestURI, ex.message)
        val problem = baseProblem(
            HttpStatus.METHOD_NOT_ALLOWED,
            "Method not allowed",
            ex.message,
            request
        )
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(problem)
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(
        ex: BadCredentialsException?,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Bad credentials: {} {}", request.method, request.requestURI)
        val problem = baseProblem(
            HttpStatus.UNAUTHORIZED,
            "Authentication failed",
            "Неверные учетные данные",
            request
        )
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem)
    }

    @ExceptionHandler(InsufficientAuthenticationException::class)
    fun handleInsufficientAuth(
        ex: InsufficientAuthenticationException?,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Authentication required: {} {}", request.method, request.requestURI)
        val problem = baseProblem(
            HttpStatus.UNAUTHORIZED,
            "Authentication required",
            "Требуется аутентификация",
            request
        )
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem)
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(
        ex: AccessDeniedException?,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        log.warn("Access denied: {} {}", request.method, request.requestURI)
        val problem = baseProblem(
            HttpStatus.FORBIDDEN,
            "Access denied",
            "Доступ запрещен",
            request
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem)
    }

    @ExceptionHandler(ProfileServiceException::class)
    fun handleProjectsException(
        ex: ProfileServiceException,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        val type = ex.errorType?: ProfileErrorType.INTERNAL

        val detail: String? = if (!ex.message.isNullOrBlank())
            ex.message
        else
            type.detail

        log.warn(
            "ProjectsException: {} {} -> type={} message={}",
            request.method, request.requestURI, type.name, detail, ex
        )

        val problem = baseProblem(
            type.httpStatus,
            type.detail,
            detail,
            request
        )
        problem.setProperty("errorType", type.name)

        return ResponseEntity.status(type.httpStatus).body(problem)
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneric(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ProblemDetail> {
        log.error("Unhandled exception: {} {}", request.method, request.requestURI, ex)
        val problem = baseProblem(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Unexpected error occurred",
            ex.message,
            request
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem)
    }
}
