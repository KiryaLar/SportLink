import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Button,
} from '@mui/material'
import {
  SportsSoccer as MatchIcon,
  Group as PlayersIcon,
  LocationOn as PlacesIcon,
  Notifications as NotifIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { getMyMatches } from '../api/matches.api'
import { getAllProfiles } from '../api/profiles.api'
import { getPlaces } from '../api/places.api'
import { getCount } from '../api/notifications.api'
import MatchCard from '../components/matches/MatchCard'
import { ALL_SPORTS, Sport } from '../types'
import SportChip from '../components/common/SportChip'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
  loading?: boolean
}

function StatCard({ icon, label, value, color, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={40} height={28} />
            ) : (
              <Typography variant="h5" fontWeight={700}>
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: myMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', 'my'],
    queryFn: getMyMatches,
  })

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles', 'all'],
    queryFn: getAllProfiles,
  })

  const { data: places, isLoading: placesLoading } = useQuery({
    queryKey: ['places'],
    queryFn: getPlaces,
  })

  const { data: notifCount, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: getCount,
  })

  const now = new Date()
  const upcomingMatches = (myMatches ?? [])
    .filter((m) => new Date(m.scheduledAt) > now && m.status === 'OPEN')
    .slice(0, 6)

  const activePlaces = (places ?? []).filter((p) => p.status === 'ACTIVE').length
  const placeNameById = places ? Object.fromEntries(places.map((p) => [p.id, p.name])) : {}

  const sportsList: Sport[] = ALL_SPORTS.slice(0, 8)

  return (
    <Box>
      {/* Welcome section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #4361EE 0%, #38BDF8 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Добро пожаловать, {user?.name?.split(' ')[0] ?? 'спортсмен'}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2.5 }}>
            Готовы к новым спортивным достижениям?
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
            }}
            startIcon={<AddIcon />}
            onClick={() => navigate('/matches/create')}
          >
            Создать матч
          </Button>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 80,
            bottom: -60,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
          }}
        />
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<MatchIcon />}
            label="Мои матчи"
            value={myMatches?.length ?? 0}
            color="#4361EE"
            loading={matchesLoading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PlayersIcon />}
            label="Игроков"
            value={profiles?.length ?? 0}
            color="#22C55E"
            loading={profilesLoading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PlacesIcon />}
            label="Площадок"
            value={activePlaces}
            color="#F59E0B"
            loading={placesLoading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<NotifIcon />}
            label="Уведомлений"
            value={notifCount?.unreadCount ?? 0}
            color="#EF4444"
            loading={notifLoading}
          />
        </Grid>
      </Grid>

      {/* Upcoming matches */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Ближайшие матчи
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/matches')}
            sx={{ color: 'primary.main' }}
          >
            Все матчи
          </Button>
        </Box>

        {matchesLoading ? (
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" width={280} height={200} sx={{ borderRadius: 2, flexShrink: 0 }} />
            ))}
          </Box>
        ) : upcomingMatches.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>
              У вас нет предстоящих матчей
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate('/matches/create')}
            >
              Создать матч
            </Button>
          </Card>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
            }}
          >
            {upcomingMatches.map((match) => (
              <Box key={match.id} sx={{ minWidth: 280, flexShrink: 0 }}>
                <MatchCard match={match} placeName={placeNameById[match.sportsPlaceId]} />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Find players by sport */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Найти игроков по виду спорта
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/players')}
            sx={{ color: 'primary.main' }}
          >
            Все игроки
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {sportsList.map((sport) => (
                <SportChip
                  key={sport}
                  sport={sport}
                  onClick={() => navigate(`/players?sport=${sport}`)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
