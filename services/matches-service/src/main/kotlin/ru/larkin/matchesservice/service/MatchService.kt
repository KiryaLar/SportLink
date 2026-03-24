package ru.larkin.matchesservice.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.larkin.common.events.MatchEvent
import ru.larkin.common.events.MatchEventType
import ru.larkin.matchesservice.dto.req.MatchCreateRequest
import ru.larkin.matchesservice.dto.req.MatchSearchRequest
import ru.larkin.matchesservice.dto.req.MatchUpdateRequest
import ru.larkin.matchesservice.dto.resp.MatchResponse
import ru.larkin.matchesservice.dto.resp.MatchSummaryResponse
import ru.larkin.matchesservice.entity.Match
import ru.larkin.matchesservice.entity.MatchStatus
import ru.larkin.matchesservice.exception.NotFoundException
import ru.larkin.matchesservice.kafka.producer.MatchEventPublisher
import ru.larkin.matchesservice.repository.MatchRepository
import java.util.UUID

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val participantService: MatchParticipantService,
    private val eventPublisher: MatchEventPublisher
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
    fun searchMatches(request: MatchSearchRequest): List<MatchSummaryResponse> {
        val matches = if (request.latitude != null && request.longitude != null && request.radiusKm != null) {
            matchRepository.searchMatchesByLocation(
                request.sport,
                request.status,
                request.latitude,
                request.longitude,
                request.radiusKm
            )
        } else {
            matchRepository.searchMatches(
                request.sport,
                request.status,
                request.dateFrom,
                request.dateTo,
                request.minLevel,
                request.maxLevel
            )
        }
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
            locationName = request.locationName,
            latitude = request.latitude,
            longitude = request.longitude,
            maxParticipants = request.maxParticipants,
            minLevel = request.minLevel,
            maxLevel = request.maxLevel,
            description = request.description
        )

        val savedMatch = matchRepository.save(match)

        // Добавляем организатора как первого участника
        participantService.addParticipant(savedMatch.id!!, organizerId, isOrganizer = true)

        // Публикуем событие
        eventPublisher.publishMatchCreated(savedMatch.toMatchEvent())

        return savedMatch.toMatchResponse()
    }

    @Transactional
    fun updateMatch(matchId: Long, request: MatchUpdateRequest): MatchResponse {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }

        request.title?.let { match.title = it }
        request.scheduledAt?.let { match.scheduledAt = it }
        request.locationName?.let { match.locationName = it }
        request.latitude?.let { match.latitude = it }
        request.longitude?.let { match.longitude = it }
        request.maxParticipants?.let { match.maxParticipants = it }
        request.minLevel?.let { match.minLevel = it }
        request.maxLevel?.let { match.maxLevel = it }
        request.description?.let { match.description = it }

        val updatedMatch = matchRepository.save(match)
        
        // Публикуем событие
        eventPublisher.publishMatchUpdated(updatedMatch.toMatchEvent())
        
        return updatedMatch.toMatchResponse()
    }

    @Transactional
    fun updateMatchStatus(matchId: Long, status: MatchStatus): MatchResponse {
        val match = matchRepository.findById(matchId)
            .orElseThrow { NotFoundException.matchNotFound(matchId) }

        match.status = status
        val updatedMatch = matchRepository.save(match)
        
        // Публикуем событие в зависимости от статуса
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
}

private fun Match.toMatchResponse(): MatchResponse {
    return MatchResponse(
        id = id!!,
        organizerId = organizerId.toString(),
        title = title,
        sport = sport,
        scheduledAt = scheduledAt,
        locationName = locationName,
        latitude = latitude,
        longitude = longitude,
        maxParticipants = maxParticipants,
        currentParticipants = getParticipantCount(),
        minLevel = minLevel,
        maxLevel = maxLevel,
        description = description,
        status = status,
        participants = participants.map { it.toParticipantResponse() },
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

private fun Match.toMatchSummaryResponse(): MatchSummaryResponse {
    return MatchSummaryResponse(
        id = id!!,
        organizerId = organizerId.toString(),
        title = title,
        sport = sport,
        scheduledAt = scheduledAt,
        locationName = locationName,
        latitude = latitude,
        longitude = longitude,
        maxParticipants = maxParticipants,
        currentParticipants = getParticipantCount(),
        minLevel = minLevel,
        maxLevel = maxLevel,
        status = status
    )
}

private fun Match.toMatchEvent(): MatchEvent {
    return MatchEvent(
        matchId = id!!,
        type = MatchEventType.CREATED,
        organizerId = organizerId,
        title = title,
        sport = sport,
        scheduledAt = scheduledAt,
        locationName = locationName,
        latitude = latitude,
        longitude = longitude,
        maxParticipants = maxParticipants,
        currentParticipants = getParticipantCount(),
        status = status.name
    )
}
