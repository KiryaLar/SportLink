import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  Chip,
  Skeleton,
  Alert,
  InputAdornment,
  Slider,
} from '@mui/material'
import {
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { searchProfiles } from '../api/profiles.api'
import UserAvatar from '../components/common/UserAvatar'
import SportChip from '../components/common/SportChip'
import EmptyState from '../components/common/EmptyState'
import { Sport, ProfileSummaryResponse, ALL_SPORTS, SPORT_LABELS } from '../types'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function PlayersPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialSport = searchParams.get('sport') as Sport | null

  const [city, setCity] = useState('')
  const [selectedSport, setSelectedSport] = useState<Sport | ''>(initialSport ?? '')
  const [levelRange, setLevelRange] = useState<number[]>([1, 10])

  const debouncedCity = useDebounce(city, 400)

  const { data: players, isLoading, error } = useQuery({
    queryKey: ['profiles', 'search', debouncedCity, selectedSport, levelRange],
    queryFn: () =>
      searchProfiles({
        city: debouncedCity || undefined,
        sport: selectedSport || undefined,
        minLevel: levelRange[0] > 1 ? levelRange[0] : undefined,
        maxLevel: levelRange[1] < 10 ? levelRange[1] : undefined,
      }),
  })

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Найти игроков
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 0 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
              <TextField
                value={city}
                onChange={(e) => setCity(e.target.value)}
                label="Город"
                fullWidth
                placeholder="Москва"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                <Chip
                  label="Все виды"
                  size="small"
                  onClick={() => setSelectedSport('')}
                  color={selectedSport === '' ? 'primary' : 'default'}
                  variant={selectedSport === '' ? 'filled' : 'outlined'}
                />
                {ALL_SPORTS.map((sport) => (
                  <Chip
                    key={sport}
                    label={SPORT_LABELS[sport]}
                    size="small"
                    onClick={() => setSelectedSport(selectedSport === sport ? '' : sport)}
                    color={selectedSport === sport ? 'primary' : 'default'}
                    variant={selectedSport === sport ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Уровень: {levelRange[0]}–{levelRange[1]}
              </Typography>
              <Slider
                value={levelRange}
                onChange={(_, val) => setLevelRange(val as number[])}
                valueLabelDisplay="auto"
                min={1}
                max={10}
                marks
                step={1}
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Не удалось загрузить список игроков
        </Alert>
      )}

      {/* Players grid */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton height={20} width="70%" />
                      <Skeleton height={16} width="50%" />
                    </Box>
                  </Box>
                  <Skeleton height={28} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !players || players.length === 0 ? (
        <EmptyState
          title="Игроков не найдено"
          description="Попробуйте изменить параметры поиска"
        />
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Найдено: {players.length} игрок(ов)
          </Typography>
          <Grid container spacing={2}>
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} onClick={() => navigate(`/profile/${player.id}`)} />
            ))}
          </Grid>
        </>
      )}
    </Box>
  )
}

function PlayerCard({
  player,
  onClick,
}: {
  player: ProfileSummaryResponse
  onClick: () => void
}) {
  const visibleSports = player.sports?.slice(0, 3) ?? []
  const extraSports = (player.sports?.length ?? 0) - visibleSports.length

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        sx={{
          height: '100%',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          },
        }}
      >
        <CardActionArea onClick={onClick} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <UserAvatar name={player.name} avatarUrl={player.avatarUrl} size={48} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {player.name}
                </Typography>
                {player.city && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <LocationIcon sx={{ fontSize: 13 }} />
                    <Typography variant="caption" noWrap>
                      {player.city}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {visibleSports.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {visibleSports.map((s) => (
                  <SportChip key={s.sport} sport={s.sport} showIcon={false} />
                ))}
                {extraSports > 0 && (
                  <Chip label={`+${extraSports}`} size="small" variant="outlined" />
                )}
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}
