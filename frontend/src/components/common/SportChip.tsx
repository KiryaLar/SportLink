import React from 'react'
import { Chip, ChipProps } from '@mui/material'
import {
  SportsSoccer,
  SportsTennis,
  SportsBasketball,
  SportsVolleyball,
  Pool,
  DirectionsRun,
  DirectionsBike,
  SportsHockey,
} from '@mui/icons-material'
import { Sport, SPORT_LABELS } from '../../types'

interface SportConfig {
  label: string
  icon: React.ReactElement
  bgcolor: string
  color: string
}

const SPORT_CONFIG: Record<Sport, SportConfig> = {
  FOOTBALL: {
    label: SPORT_LABELS.FOOTBALL,
    icon: <SportsSoccer fontSize="small" />,
    bgcolor: '#DCFCE7',
    color: '#16A34A',
  },
  TENNIS: {
    label: SPORT_LABELS.TENNIS,
    icon: <SportsTennis fontSize="small" />,
    bgcolor: '#FEF9C3',
    color: '#CA8A04',
  },
  BASKETBALL: {
    label: SPORT_LABELS.BASKETBALL,
    icon: <SportsBasketball fontSize="small" />,
    bgcolor: '#FEE2E2',
    color: '#DC2626',
  },
  VOLLEYBALL: {
    label: SPORT_LABELS.VOLLEYBALL,
    icon: <SportsVolleyball fontSize="small" />,
    bgcolor: '#E0F2FE',
    color: '#0284C7',
  },
  SWIMMING: {
    label: SPORT_LABELS.SWIMMING,
    icon: <Pool fontSize="small" />,
    bgcolor: '#DBEAFE',
    color: '#2563EB',
  },
  RUNNING: {
    label: SPORT_LABELS.RUNNING,
    icon: <DirectionsRun fontSize="small" />,
    bgcolor: '#FCE7F3',
    color: '#DB2777',
  },
  CYCLING: {
    label: SPORT_LABELS.CYCLING,
    icon: <DirectionsBike fontSize="small" />,
    bgcolor: '#F3E8FF',
    color: '#9333EA',
  },
  HOCKEY: {
    label: SPORT_LABELS.HOCKEY,
    icon: <SportsHockey fontSize="small" />,
    bgcolor: '#E0F2FE',
    color: '#0891B2',
  },
  BADMINTON: {
    label: SPORT_LABELS.BADMINTON,
    icon: <SportsTennis fontSize="small" />,
    bgcolor: '#FFF7ED',
    color: '#EA580C',
  },
  TABLE_TENNIS: {
    label: SPORT_LABELS.TABLE_TENNIS,
    icon: <SportsTennis fontSize="small" />,
    bgcolor: '#F0FDF4',
    color: '#15803D',
  },
}

interface SportChipProps extends Omit<ChipProps, 'label' | 'icon' | 'color'> {
  sport: Sport
  showIcon?: boolean
}

export default function SportChip({ sport, showIcon = true, size = 'small', sx, ...props }: SportChipProps) {
  const config = SPORT_CONFIG[sport]
  if (!config) return null

  return (
    <Chip
      label={config.label}
      icon={showIcon ? config.icon : undefined}
      size={size}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 500,
        border: 'none',
        '& .MuiChip-icon': {
          color: config.color,
        },
        ...sx,
      }}
      {...props}
    />
  )
}

export { SPORT_CONFIG }
