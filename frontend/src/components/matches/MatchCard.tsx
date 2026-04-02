import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MatchSummaryResponse, MatchResponse } from '../../types'
import SportChip from '../common/SportChip'
import StatusBadge from '../common/StatusBadge'

type MatchCardData = MatchSummaryResponse | MatchResponse

interface MatchCardProps {
  match: MatchCardData
  placeName?: string
  onClick?: () => void
  compact?: boolean
}

export default function MatchCard({ match, placeName, onClick, compact = false }: MatchCardProps) {
  const navigate = useNavigate()

  const handleClick = onClick ?? (() => navigate(`/matches/${match.id}`))

  const fillPercent = match.maxParticipants > 0
    ? (match.currentParticipants / match.maxParticipants) * 100
    : 0

  const isFull = match.currentParticipants >= match.maxParticipants

  const formattedDate = (() => {
    try {
      return format(new Date(match.scheduledAt), 'd MMM, HH:mm', { locale: ru })
    } catch {
      return match.scheduledAt
    }
  })()

  const minLevel = 'minLevel' in match ? match.minLevel : undefined
  const maxLevel = 'maxLevel' in match ? match.maxLevel : undefined

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardContent sx={{ flexGrow: 1, p: compact ? 2 : 2.5 }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <SportChip sport={match.sport} />
            <StatusBadge status={match.status} type="match" />
          </Box>

          {/* Title */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
            }}
          >
            {match.title}
          </Typography>

          {/* Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, color: 'text.secondary' }}>
            <CalendarIcon sx={{ fontSize: 15 }} />
            <Typography variant="body2" fontSize="0.8125rem">
              {formattedDate}
            </Typography>
          </Box>

          {/* Place */}
          {placeName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, color: 'text.secondary' }}>
              <LocationIcon sx={{ fontSize: 15 }} />
              <Typography
                variant="body2"
                fontSize="0.8125rem"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {placeName}
              </Typography>
            </Box>
          )}

          {/* Level */}
          {(minLevel || maxLevel) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, color: 'text.secondary' }}>
              <TrophyIcon sx={{ fontSize: 15 }} />
              <Typography variant="body2" fontSize="0.8125rem">
                Уровень:{' '}
                {minLevel && maxLevel
                  ? `${minLevel}–${maxLevel}`
                  : minLevel
                  ? `от ${minLevel}`
                  : `до ${maxLevel}`}
              </Typography>
            </Box>
          )}

          {/* Participants progress */}
          <Box sx={{ mt: 'auto', pt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Участники
                </Typography>
              </Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color={isFull ? 'error.main' : 'text.primary'}
              >
                {match.currentParticipants}/{match.maxParticipants}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={fillPercent}
              color={isFull ? 'error' : fillPercent > 70 ? 'warning' : 'primary'}
              sx={{ height: 5, borderRadius: 2.5 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
