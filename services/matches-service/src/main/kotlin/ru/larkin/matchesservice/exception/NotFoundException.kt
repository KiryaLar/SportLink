package ru.larkin.matchesservice.exception

class NotFoundException(message: String) : RuntimeException(message) {
    companion object {
        fun matchNotFound(matchId: Long): NotFoundException {
            return NotFoundException("Матч с id $matchId не найден")
        }

        fun participantNotFound(participantId: Long): NotFoundException {
            return NotFoundException("Участник с id $participantId не найден")
        }
    }
}
