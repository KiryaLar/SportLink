package ru.larkin.matchesservice.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.matchesservice.dto.resp.MatchParticipantResponse
import ru.larkin.matchesservice.entity.MatchParticipant
import ru.larkin.matchesservice.entity.ParticipantStatus
import ru.larkin.matchesservice.exception.MatchServiceException
import ru.larkin.matchesservice.repository.MatchParticipantRepository
import ru.larkin.matchesservice.repository.MatchRepository
import java.util.UUID

@Service
class MatchParticipantService(
    private val matchParticipantRepository: MatchParticipantRepository,
    private val matchRepository: MatchRepository
) {

    @Transactional(readOnly = true)
    fun getParticipantsByMatchId(matchId: Long): List<MatchParticipantResponse> {
        return matchParticipantRepository.findByMatchId(matchId)
            .map { it.toParticipantResponse() }
    }

    @Transactional(readOnly = true)
    fun getMatchesByUserId(userId: UUID): List<MatchParticipantResponse> {
        return matchParticipantRepository.findByUserId(userId)
            .map { it.toParticipantResponse() }
    }

    @Transactional
    fun addParticipant(matchId: Long, userId: UUID, isOrganizer: Boolean = false): MatchParticipantResponse {
        val match = matchRepository.findById(matchId)
            .orElseThrow { ru.larkin.matchesservice.exception.NotFoundException.matchNotFound(matchId) }

        if (matchParticipantRepository.existsByMatchIdAndUserId(matchId, userId)) {
            throw MatchServiceException("Вы уже являетесь участником этого матча")
        }

        if (!match.hasAvailableSlots()) {
            throw MatchServiceException("Нет доступных мест для участия")
        }

        val participant = MatchParticipant(
            userId = userId,
            status = if (isOrganizer) ParticipantStatus.CONFIRMED else ParticipantStatus.PENDING
        )

        match.addParticipant(participant)
        matchParticipantRepository.save(participant)

        return participant.toParticipantResponse()
    }

    @Transactional
    fun joinMatch(matchId: Long, userId: UUID): MatchParticipantResponse {
        return addParticipant(matchId, userId, isOrganizer = false)
    }

    @Transactional
    fun leaveMatch(matchId: Long, userId: UUID) {
        val participant = matchParticipantRepository.findByMatchIdAndUserId(matchId, userId)
            ?: throw MatchServiceException("Вы не являетесь участником этого матча")

        if (participant.status == ParticipantStatus.COMPLETED) {
            throw MatchServiceException("Нельзя покинуть завершенный матч")
        }

        participant.status = ParticipantStatus.CANCELLED
        matchParticipantRepository.save(participant)
    }

    @Transactional
    fun confirmParticipant(participantId: Long) {
        val participant = matchParticipantRepository.findById(participantId)
            .orElseThrow { ru.larkin.matchesservice.exception.NotFoundException.participantNotFound(participantId) }

        participant.status = ParticipantStatus.CONFIRMED
        matchParticipantRepository.save(participant)
    }

    @Transactional
    fun removeParticipant(participantId: Long) {
        if (!matchParticipantRepository.existsById(participantId)) {
            throw ru.larkin.matchesservice.exception.NotFoundException.participantNotFound(participantId)
        }
        matchParticipantRepository.deleteById(participantId)
    }

    @Transactional
    fun completeParticipant(participantId: Long) {
        val participant = matchParticipantRepository.findById(participantId)
            .orElseThrow { ru.larkin.matchesservice.exception.NotFoundException.participantNotFound(participantId) }

        participant.status = ParticipantStatus.COMPLETED
        matchParticipantRepository.save(participant)
    }
}

fun MatchParticipant.toParticipantResponse(): MatchParticipantResponse {
    return MatchParticipantResponse(
        id = id!!,
        userId = userId.toString(),
        playerName = playerName,
        status = status,
        joinedAt = joinedAt
    )
}
