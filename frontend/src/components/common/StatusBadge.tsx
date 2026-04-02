import { Chip, ChipProps } from '@mui/material'
import { MatchStatus, PlaceStatus } from '../../types'

type StatusType = 'match' | 'place'

interface StatusConfig {
  label: string
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

const MATCH_STATUS_CONFIG: Record<MatchStatus, StatusConfig> = {
  OPEN: { label: 'Открыт', color: 'success' },
  READY: { label: 'Готов', color: 'info' },
  IN_PROGRESS: { label: 'В процессе', color: 'warning' },
  FINISHED: { label: 'Завершён', color: 'default' },
  CANCELLED: { label: 'Отменён', color: 'error' },
}

const PLACE_STATUS_CONFIG: Record<PlaceStatus, StatusConfig> = {
  PENDING: { label: 'На проверке', color: 'warning' },
  ACTIVE: { label: 'Активна', color: 'success' },
  INACTIVE: { label: 'Неактивна', color: 'default' },
  REJECTED: { label: 'Отклонена', color: 'error' },
}

interface StatusBadgeProps extends Omit<ChipProps, 'color' | 'label'> {
  status: string
  type: StatusType
}

export default function StatusBadge({ status, type, size = 'small', sx, ...props }: StatusBadgeProps) {
  const config =
    type === 'match'
      ? MATCH_STATUS_CONFIG[status as MatchStatus]
      : PLACE_STATUS_CONFIG[status as PlaceStatus]

  if (!config) {
    return <Chip label={status} size={size} sx={sx} {...props} />
  }

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600, ...sx }}
      {...props}
    />
  )
}
