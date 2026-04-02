package ru.larkin.sportsplacesservice.exception

class NotFoundException(message: String) : RuntimeException(message) {
    companion object {
        fun placeNotFound(placeId: Long): NotFoundException {
            return NotFoundException("Площадка с id $placeId не найдена")
        }
    }
}
