package ru.larkin.notificationservice.exception

class NotFoundException(message: String) : RuntimeException(message) {
    companion object {
        fun notificationNotFound(notificationId: Long): NotFoundException {
            return NotFoundException("Уведомление с id $notificationId не найдено")
        }
    }
}
