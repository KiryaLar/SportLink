package ru.larkin.notificationservice.controller

import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import ru.larkin.notificationservice.dto.resp.NotificationCountResponse
import ru.larkin.notificationservice.dto.resp.NotificationResponse
import ru.larkin.notificationservice.service.NotificationService
import java.util.UUID

@RestController
@RequestMapping("/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {

    @GetMapping
    fun getMyNotifications(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<List<NotificationResponse>> {
        val userId = UUID.fromString(jwt.subject)
        val notifications = notificationService.getNotificationsByUserId(userId, PageRequest.of(page, size))
        return ResponseEntity.ok(notifications.content)
    }

    @GetMapping("/unread")
    fun getUnreadNotifications(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<List<NotificationResponse>> {
        val userId = UUID.fromString(jwt.subject)
        val notifications = notificationService.getUnreadNotifications(userId, PageRequest.of(page, size))
        return ResponseEntity.ok(notifications.content)
    }

    @GetMapping("/count")
    fun getNotificationCount(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<NotificationCountResponse> {
        val userId = UUID.fromString(jwt.subject)
        return ResponseEntity.ok(notificationService.getNotificationCount(userId))
    }

    @GetMapping("/{id}")
    fun getNotificationById(@PathVariable("id") notificationId: Long): ResponseEntity<NotificationResponse> {
        return ResponseEntity.ok(notificationService.getNotificationById(notificationId))
    }

    @PostMapping("/{id}/read")
    fun markAsRead(@PathVariable("id") notificationId: Long): ResponseEntity<Unit> {
        notificationService.markAsRead(notificationId)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/read-all")
    fun markAllAsRead(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<Unit> {
        val userId = UUID.fromString(jwt.subject)
        notificationService.markAllAsRead(userId)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/{id}")
    fun deleteNotification(@PathVariable("id") notificationId: Long): ResponseEntity<Unit> {
        notificationService.deleteNotification(notificationId)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping
    fun deleteAllNotifications(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<Unit> {
        val userId = UUID.fromString(jwt.subject)
        notificationService.deleteAllNotifications(userId)
        return ResponseEntity.noContent().build()
    }
}
