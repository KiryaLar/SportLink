package ru.larkin.messagingservice.exception

import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.net.URI
import java.time.Instant

@RestControllerAdvice
class GlobalExceptionHandler {
    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException, request: HttpServletRequest): ResponseEntity<ProblemDetail> {
        log.warn("Bad request: ${ex.message}", ex)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.message)
        problem.title = "Bad Request"
        problem.instance = URI.create(request.requestURI)
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception, request: HttpServletRequest): ResponseEntity<ProblemDetail> {
        log.error("Unexpected error: ${ex.message}", ex)
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Внутренняя ошибка сервера")
        problem.title = "Internal Server Error"
        problem.instance = URI.create(request.requestURI)
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(ex: NotFoundException, request: HttpServletRequest): ResponseEntity<ProblemDetail> {
        log.warn("Not found: ${ex.message}")
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.message)
        problem.title = "Not Found"
        problem.instance = URI.create(request.requestURI)
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(ChatServiceException::class)
    fun handleChatServiceException(ex: ChatServiceException, request: HttpServletRequest): ResponseEntity<ProblemDetail> {
        log.warn("Chat service error: ${ex.message}")
        val problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.message)
        problem.title = "Chat Service Error"
        problem.instance = URI.create(request.requestURI)
        problem.setProperty("timestamp", Instant.now().toString())
        return ResponseEntity(problem, HttpStatus.BAD_REQUEST)
    }
}
