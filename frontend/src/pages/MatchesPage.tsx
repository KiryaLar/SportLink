import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Chip,
} from '@mui/material'
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { searchMatches } from '../api/matches.api'
import { getPlaces } from '../api/places.api'
import MatchCard from '../components/matches/MatchCard'
import EmptyState from '../components/common/EmptyState'
import { Sport, MatchStatus, ALL_SPORTS, SPORT_LABELS } from '../types'

const STATUS_OPTIONS: { value: MatchStatus | ''; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'OPEN', label: 'Открытые' },
  { value: 'READY', label: 'Готовые' },
  { value: 'IN_PROGRESS', label: 'В процессе' },
  { value: 'FINISHED', label: 'Завершённые' },
  { value: 'CANCELLED', label: 'Отменённые' },
]

export default function MatchesPage() {
  const navigate = useNavigate()
  const [selectedSport, setSelectedSport] = useState<Sport | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | ''>('OPEN')

  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['matches', 'search', selectedSport, selectedStatus],
    queryFn: () =>
      searchMatches({
        sport: selectedSport || undefined,
        status: selectedStatus || undefined,
      }),
  })

  const { data: places } = useQuery({
    queryKey: ['places'],
    queryFn: getPlaces,
    staleTime: 60000,
  })

  const placeNameById = places
    ? Object.fromEntries(places.map((p) => [p.id, p.name]))
    : {}

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Матчи
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Найдите матч и присоединяйтесь
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/matches/create')}
        >
          Создать матч
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <FilterIcon fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              Фильтры:
            </Typography>
          </Box>

          {/* Sport chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
            <Chip
              label="Все виды"
              onClick={() => setSelectedSport('')}
              color={selectedSport === '' ? 'primary' : 'default'}
              variant={selectedSport === '' ? 'filled' : 'outlined'}
              size="small"
            />
            {ALL_SPORTS.map((sport) => (
              <Chip
                key={sport}
                label={SPORT_LABELS[sport]}
                onClick={() => setSelectedSport(selectedSport === sport ? '' : sport)}
                color={selectedSport === sport ? 'primary' : 'default'}
                variant={selectedSport === sport ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={selectedStatus}
              label="Статус"
              onChange={(e) => setSelectedStatus(e.target.value as MatchStatus | '')}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Не удалось загрузить матчи. Попробуйте обновить страницу.
        </Alert>
      )}

      {/* Matches grid */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : !matches || matches.length === 0 ? (
        <EmptyState
          title="Матчей не найдено"
          description="По выбранным фильтрам матчей нет. Создайте первый матч!"
          action={{
            label: 'Создать матч',
            onClick: () => navigate('/matches/create'),
          }}
        />
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Найдено: {matches.length} матч(ей)
          </Typography>
          <Grid container spacing={2}>
            {matches.map((match) => (
              <Grid item xs={12} sm={6} md={4} key={match.id}>
                <MatchCard match={match} placeName={placeNameById[match.sportsPlaceId]} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  )
}
