package ru.larkin.messagingservice.exception

class NotFoundException(message: String) : RuntimeException(message) {
    companion object {
        fun chatNotFound(chatId: Long): NotFoundException {
            return NotFoundException("Чат с id $chatId не найден")
        }

        fun messageNotFound(messageId: Long): NotFoundException {
            return NotFoundException("Сообщение с id $messageId не найдено")
        }
    }
}
