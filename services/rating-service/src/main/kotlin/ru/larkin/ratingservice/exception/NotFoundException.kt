package ru.larkin.ratingservice.exception

class NotFoundException(message: String) : RuntimeException(message) {
    companion object {
        fun reviewNotFound(reviewId: Long): NotFoundException {
            return NotFoundException("Отзыв с id $reviewId не найден")
        }

        fun userRatingNotFound(userId: String): NotFoundException {
            return NotFoundException("Рейтинг пользователя $userId не найден")
        }
    }
}
