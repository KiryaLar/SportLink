package ru.larkin.matchesservice.utils

import ru.larkin.common.events.MatchEvent
import ru.larkin.common.events.MatchEventType
import ru.larkin.matchesservice.dto.resp.MatchParticipantResponse
import ru.larkin.matchesservice.dto.resp.MatchResponse
import ru.larkin.matchesservice.dto.resp.MatchSummaryResponse
import ru.larkin.matchesservice.entity.Match
import ru.larkin.matchesservice.entity.MatchParticipant

/**
 * Конвертация MatchParticipant в MatchParticipantResponse
 */
fun MatchParticipant.toParticipantResponse(): MatchParticipantResponse {
    return MatchParticipantResponse(
        id = id!!,
        userId = userId.toString(),
        playerName = playerName,
        status = status,
        joinedAt = joinedAt
    )
}

/**
 * Конвертация Match в MatchResponse
 */
fun Match.toMatchResponse(): MatchResponse {
    return MatchResponse(
        id = id!!,
        organizerId = organizerId.toString(),
        title = title,
        sport = sport,
        scheduledAt = scheduledAt,
        sportsPlaceId = sportsPlaceId,
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

/**
 * Конвертация Match в MatchSummaryResponse
 */
fun Match.toMatchSummaryResponse(): MatchSummaryResponse {
    return MatchSummaryResponse(
        id = id!!,
        organizerId = organizerId.toString(),
        title = title,
        sport = sport,
        scheduledAt = scheduledAt,
        sportsPlaceId = sportsPlaceId,
        maxParticipants = maxParticipants,
        currentParticipants = getParticipantCount(),
        minLevel = minLevel,
        maxLevel = maxLevel,
        status = status
    )
}

/**
 * Конвертация Match в MatchEvent
 */
fun Match.toMatchEvent(type: MatchEventType = MatchEventType.CREATED): MatchEvent {
    return MatchEvent(
        matchId = id!!,
        type = type,
        organizerId = organizerId,
        title = title,
        sport = sport,
        scheduledAt = scheduledAt,
        sportsPlaceId = sportsPlaceId,
        maxParticipants = maxParticipants,
        currentParticipants = getParticipantCount(),
        status = status.name
    )
}
