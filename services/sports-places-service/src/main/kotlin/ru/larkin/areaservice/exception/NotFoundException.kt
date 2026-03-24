package ru.larkin.areaservice.exception

class NotFoundException(message: String) : RuntimeException(message) {
    companion object {
        fun placeNotFound(placeId: Long): NotFoundException {
            return NotFoundException("Площадка с id $placeId не найдена")
        }
    }
}
