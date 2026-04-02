import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Autocomplete,
  Slider,
  Chip,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  SportsSoccer as SportIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Description as DescIcon,
  EmojiEvents as LevelIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createMatch } from '../api/matches.api'
import { getPlaces } from '../api/places.api'
import { ALL_SPORTS, SPORT_LABELS, SportsPlaceSummaryResponse } from '../types'

const schema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа').max(100),
  sport: z.enum(['FOOTBALL', 'TENNIS', 'BASKETBALL', 'VOLLEYBALL', 'SWIMMING', 'RUNNING', 'CYCLING', 'HOCKEY', 'BADMINTON', 'TABLE_TENNIS'] as const),
  scheduledAt: z.string().min(1, 'Укажите дату и время'),
  sportsPlaceId: z.string().min(1, 'Выберите площадку'),
  maxParticipants: z.number().min(2).max(50),
  minLevel: z.number().min(1).max(10).optional(),
  maxLevel: z.number().min(1).max(10).optional(),
  description: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

export default function MatchCreatePage() {
  const navigate = useNavigate()
  const [levelRange, setLevelRange] = useState<number[]>([1, 10])

  const { data: places } = useQuery({
    queryKey: ['places'],
    queryFn: getPlaces,
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      maxParticipants: 10,
    },
  })

  const createMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: (data) => {
      toast.success('Матч успешно создан!')
      navigate(`/matches/${data.id}`)
    },
    onError: () => {
      toast.error('Не удалось создать матч')
    },
  })

  const onSubmit = async (data: FormData) => {
    createMutation.mutate({
      title: data.title,
      sport: data.sport,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      sportsPlaceId: data.sportsPlaceId,
      maxParticipants: data.maxParticipants,
      minLevel: levelRange[0] > 1 ? levelRange[0] : undefined,
      maxLevel: levelRange[1] < 10 ? levelRange[1] : undefined,
      description: data.description || undefined,
    })
  }

  const now = new Date()
  now.setMinutes(now.getMinutes() + 60)
  const minDateTime = now.toISOString().slice(0, 16)

  return (
    <Box maxWidth="md" mx="auto">
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/matches')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Назад
      </Button>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Создать матч
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescIcon color="primary" />
                  Название матча
                </Typography>
                <TextField
                  {...register('title')}
                  label="Название"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  placeholder="Например: Дружеский матч по футболу"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sport selection */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportIcon color="primary" />
                  Вид спорта
                </Typography>
                <Controller
                  name="sport"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {ALL_SPORTS.map((sport) => (
                        <Chip
                          key={sport}
                          label={SPORT_LABELS[sport]}
                          onClick={() => {
                            field.onChange(sport)
                          }}
                          color={field.value === sport ? 'primary' : 'default'}
                          variant={field.value === sport ? 'filled' : 'outlined'}
                          sx={{ fontWeight: field.value === sport ? 600 : 400 }}
                        />
                      ))}
                    </Box>
                  )}
                />
                {errors.sport && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.sport.message}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Date, place, participants */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  Дата и время
                </Typography>
                <TextField
                  {...register('scheduledAt')}
                  type="datetime-local"
                  fullWidth
                  inputProps={{ min: minDateTime }}
                  error={!!errors.scheduledAt}
                  helperText={errors.scheduledAt?.message}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="primary" />
                  Участники
                </Typography>
                <Controller
                  name="maxParticipants"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Максимум участников"
                      fullWidth
                      inputProps={{ min: 2, max: 50 }}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      error={!!errors.maxParticipants}
                      helperText={errors.maxParticipants?.message}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Place */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportIcon color="primary" />
                  Площадка
                </Typography>
                <Controller
                  name="sportsPlaceId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={places ?? []}
                      getOptionLabel={(option: SportsPlaceSummaryResponse) => `${option.name} — ${option.address}`}
                      onChange={(_, value) => field.onChange(value?.id ?? '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Выберите площадку"
                          error={!!errors.sportsPlaceId}
                          helperText={errors.sportsPlaceId?.message}
                        />
                      )}
                      noOptionsText="Площадки не найдены"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Level range */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LevelIcon color="primary" />
                  Уровень игры (необязательно)
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      От {levelRange[0]} до {levelRange[1]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {levelRange[0] === 1 && levelRange[1] === 10 ? 'Любой уровень' : `Уровень ${levelRange[0]}–${levelRange[1]}`}
                    </Typography>
                  </Box>
                  <Slider
                    value={levelRange}
                    onChange={(_, val) => setLevelRange(val as number[])}
                    valueLabelDisplay="auto"
                    min={1}
                    max={10}
                    marks
                    step={1}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Описание (необязательно)
                </Typography>
                <TextField
                  {...register('description')}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Расскажите о матче подробнее..."
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/matches')}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Создание...' : 'Создать матч'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
