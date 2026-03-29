package ru.larkin.matchesservice.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.matchesservice.dto.resp.MatchParticipantResponse
import ru.larkin.matchesservice.entity.MatchParticipant
import ru.larkin.matchesservice.entity.ParticipantStatus
import ru.larkin.matchesservice.exception.MatchServiceException
import ru.larkin.matchesservice.exception.NotFoundException
import ru.larkin.matchesservice.repository.MatchParticipantRepository
import ru.larkin.matchesservice.repository.MatchRepository
import ru.larkin.matchesservice.utils.toParticipantResponse
import java.util.*

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
    fun joinMatch(matchId: Long, userId: UUID): MatchParticipantResponse {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }

        if (matchParticipantRepository.existsByMatchIdAndUserId(matchId, userId)) {
            throw MatchServiceException("Вы уже являетесь участником этого матча")
        }

        if (!match.hasAvailableSlots()) {
            throw MatchServiceException("Нет доступных мест для участия")
        }

        val participant = MatchParticipant(
            userId = userId,
            status = ParticipantStatus.PENDING
        )

        match.addParticipant(participant)
        matchParticipantRepository.save(participant)

        return participant.toParticipantResponse()
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
    fun confirmParticipant(matchId: Long, participantId: Long) {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }

        val participant = matchParticipantRepository.findById(participantId)
            .orElseThrow { NotFoundException.participantNotFound(participantId) }

        if (match.participants.none { it.id == participantId }) {
            throw MatchServiceException("Участник с id $participantId не принадлежит матчу с id $matchId")
        }

        participant.status = ParticipantStatus.CONFIRMED
        matchParticipantRepository.save(participant)
    }

    @Transactional
    fun removeParticipant(matchId: Long, participantId: Long) {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }

        if (!matchParticipantRepository.existsById(participantId)) {
            throw NotFoundException.participantNotFound(participantId)
        }

        if (match.participants.none { it.id == participantId }) {
            throw MatchServiceException("Участник с id $participantId не принадлежит матчу с id $matchId")
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
