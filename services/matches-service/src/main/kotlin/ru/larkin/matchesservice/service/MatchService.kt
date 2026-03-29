package ru.larkin.matchesservice.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.matchesservice.dto.req.MatchCreateRequest
import ru.larkin.matchesservice.dto.req.MatchSearchRequest
import ru.larkin.matchesservice.dto.req.MatchUpdateRequest
import ru.larkin.matchesservice.dto.resp.MatchResponse
import ru.larkin.matchesservice.dto.resp.MatchSummaryResponse
import ru.larkin.matchesservice.entity.Match
import ru.larkin.matchesservice.entity.MatchParticipant
import ru.larkin.matchesservice.entity.MatchStatus
import ru.larkin.matchesservice.entity.ParticipantStatus
import ru.larkin.matchesservice.exception.NotFoundException
import ru.larkin.matchesservice.kafka.producer.MatchEventPublisher
import ru.larkin.matchesservice.repository.MatchParticipantRepository
import ru.larkin.matchesservice.repository.MatchRepository
import ru.larkin.matchesservice.utils.toMatchEvent
import ru.larkin.matchesservice.utils.toMatchResponse
import ru.larkin.matchesservice.utils.toMatchSummaryResponse
import ru.larkin.matchesservice.utils.toParticipantResponse
import java.util.*

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val participantService: MatchParticipantService,
    private val eventPublisher: MatchEventPublisher,
    private val matchParticipantRepository: MatchParticipantRepository
) {

    @Transactional(readOnly = true)
    fun getMatchById(matchId: Long): MatchResponse {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }
        return match.toMatchResponse()
    }

    @Transactional(readOnly = true)
    fun getAllMatches(): List<MatchSummaryResponse> {
        return matchRepository.findAll()
            .filter { it.status != MatchStatus.CANCELLED }
            .map { it.toMatchSummaryResponse() }
    }

    @Transactional(readOnly = true)
    fun getAllMatchesAdmin(pageable: Pageable): Page<Match> {
        return matchRepository.findAll(pageable)
    }

    @Transactional(readOnly = true)
    fun searchMatches(request: MatchSearchRequest): List<MatchSummaryResponse> {
//        val matches = if (request.latitude != null && request.longitude != null && request.radiusKm != null) {
//            matchRepository.searchMatchesByLocation(
//                request.sport,
//                request.status,
//            )
//        } else {
        val matches = matchRepository.searchMatches(
            request.sport,
            request.status,
            request.dateFrom,
            request.dateTo,
            request.minLevel,
            request.maxLevel
        )

        return matches.filter { it.status != MatchStatus.CANCELLED }.map { it.toMatchSummaryResponse() }
    }

    @Transactional(readOnly = true)
    fun getMatchesByOrganizer(organizerId: UUID): List<MatchSummaryResponse> {
        return matchRepository.findByOrganizerId(organizerId.toString())
            .map { it.toMatchSummaryResponse() }
    }

    @Transactional
    fun createMatch(organizerId: UUID, request: MatchCreateRequest): MatchResponse {
        val match = Match(
            organizerId = organizerId,
            title = request.title,
            sport = request.sport,
            scheduledAt = request.scheduledAt,
            sportsPlaceId = request.sportsPlaceId,
            maxParticipants = request.maxParticipants,
            minLevel = request.minLevel,
            maxLevel = request.maxLevel,
            description = request.description,
        )

        val savedMatch = matchRepository.save(match)

        // Добавляем организатора как первого участника
        val participant = MatchParticipant(
            userId = organizerId,
            status = ParticipantStatus.CONFIRMED
        )

        match.addParticipant(participant)
        matchParticipantRepository.save(participant)

        eventPublisher.publishMatchCreated(savedMatch.toMatchEvent())

        return savedMatch.toMatchResponse()
    }

    @Transactional
    fun updateMatch(matchId: Long, request: MatchUpdateRequest): MatchResponse {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }

        request.title?.let { match.title = it }
        request.scheduledAt?.let { match.scheduledAt = it }
        request.maxParticipants?.let { match.maxParticipants = it }
        request.minLevel?.let { match.minLevel = it }
        request.maxLevel?.let { match.maxLevel = it }
        request.description?.let { match.description = it }

        val updatedMatch = matchRepository.save(match)

        eventPublisher.publishMatchUpdated(updatedMatch.toMatchEvent())

        return updatedMatch.toMatchResponse()
    }

    @Transactional
    fun updateMatchStatus(matchId: Long, status: MatchStatus): MatchResponse {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }

        match.status = status
        val updatedMatch = matchRepository.save(match)

        when (status) {
            MatchStatus.CANCELLED -> eventPublisher.publishMatchCancelled(updatedMatch.toMatchEvent())
            MatchStatus.IN_PROGRESS -> eventPublisher.publishMatchStarted(updatedMatch.toMatchEvent())
            MatchStatus.FINISHED -> eventPublisher.publishMatchFinished(updatedMatch.toMatchEvent())
            else -> eventPublisher.publishMatchUpdated(updatedMatch.toMatchEvent())
        }

        return updatedMatch.toMatchResponse()
    }

    @Transactional
    fun deleteMatch(matchId: Long) {
        if (!matchRepository.existsById(matchId)) {
            throw NotFoundException.matchNotFound(matchId)
        }
        matchRepository.deleteById(matchId)
    }

    fun isOrganizer(matchId: Long, authentication: Authentication): Boolean {
        val jwt = authentication.principal as? Jwt ?: return false
        val userId = runCatching { UUID.fromString(jwt.subject) }.getOrNull() ?: return false

        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        return match.organizerId == userId
    }

    fun isParticipant(matchId: Long, userId: UUID): Boolean {
        return matchParticipantRepository.existsByMatchIdAndUserId(matchId, userId)
    }
}
