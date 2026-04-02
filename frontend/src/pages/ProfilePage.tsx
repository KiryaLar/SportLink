import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Rating,
  Chip,
  Skeleton,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  IconButton,
  Slider,
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  Flag as FlagIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { getMyProfile, getProfile, updateMyProfile, addContact } from '../api/profiles.api'
import { getUserRating, getUserReviews } from '../api/ratings.api'
import { createComplaint } from '../api/complaints.api'
import { useAuthStore } from '../store/auth.store'
import UserAvatar from '../components/common/UserAvatar'
import SportChip from '../components/common/SportChip'
import { ALL_SPORTS, SPORT_LABELS, ComplaintType } from '../types'

const editSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  city: z.string().optional(),
  age: z.number({ coerce: true }).min(12).max(100).optional(),
  phone: z.string().optional(),
  description: z.string().max(500).optional(),
  sports: z.array(
    z.object({
      sport: z.enum(['FOOTBALL', 'TENNIS', 'BASKETBALL', 'VOLLEYBALL', 'SWIMMING', 'RUNNING', 'CYCLING', 'HOCKEY', 'BADMINTON', 'TABLE_TENNIS'] as const),
      level: z.number().min(1).max(10),
      description: z.string().optional(),
    })
  ),
})

type EditForm = z.infer<typeof editSchema>

const COMPLAINT_TYPES: { value: ComplaintType; label: string }[] = [
  { value: 'SPAM', label: 'Спам' },
  { value: 'HARASSMENT', label: 'Домогательство' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Неприемлемый контент' },
  { value: 'OTHER', label: 'Другое' },
]

function RatingCard({ label, avg, count }: { label: string; avg?: number; count: number }) {
  return (
    <Card>
      <CardContent sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, my: 0.5 }}>
          <Typography variant="h5" fontWeight={700}>
            {avg ? avg.toFixed(1) : '—'}
          </Typography>
          {avg && <StarIcon sx={{ color: '#F59E0B', fontSize: 20 }} />}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {count} отзыв(ов)
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>()
  const queryClient = useQueryClient()
  const { user, setProfile } = useAuthStore()

  const isOwnProfile = !id || id === user?.id
  const [editMode, setEditMode] = useState(false)
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [complaintType, setComplaintType] = useState<ComplaintType>('SPAM')
  const [complaintText, setComplaintText] = useState('')

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: isOwnProfile ? ['profile', 'my'] : ['profile', id],
    queryFn: () => (isOwnProfile ? getMyProfile() : getProfile(id!)),
  })

  const profileId = profile?.id ?? id

  const { data: rating } = useQuery({
    queryKey: ['rating', profileId],
    queryFn: () => getUserRating(profileId!),
    enabled: !!profileId,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', profileId],
    queryFn: () => getUserReviews(profileId!),
    enabled: !!profileId,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  })

  const { fields: sportFields, append: appendSport, remove: removeSport } = useFieldArray({
    control,
    name: 'sports',
  })

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      setProfile(data)
      setEditMode(false)
      toast.success('Профиль обновлён')
      queryClient.invalidateQueries({ queryKey: ['profile', 'my'] })
    },
    onError: () => toast.error('Не удалось обновить профиль'),
  })

  const addContactMutation = useMutation({
    mutationFn: () => addContact(profileId!),
    onSuccess: () => toast.success('Запрос в контакты отправлен'),
    onError: () => toast.error('Не удалось отправить запрос'),
  })

  const complaintMutation = useMutation({
    mutationFn: () =>
      createComplaint({
        targetProfileId: profileId!,
        complaintType,
        complaintText,
      }),
    onSuccess: () => {
      toast.success('Жалоба отправлена')
      setComplaintDialogOpen(false)
      setComplaintText('')
    },
    onError: () => toast.error('Не удалось отправить жалобу'),
  })

  const handleEditStart = () => {
    if (profile) {
      reset({
        name: profile.name,
        city: profile.city ?? '',
        age: profile.age,
        phone: profile.phone ?? '',
        description: profile.description ?? '',
        sports: profile.sports ?? [],
      })
    }
    setEditMode(true)
  }

  if (profileLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box>
            <Skeleton width={200} height={32} />
            <Skeleton width={120} height={20} />
          </Box>
        </Box>
        <Skeleton height={200} sx={{ borderRadius: 2 }} />
      </Box>
    )
  }

  if (!profile) {
    return <Alert severity="error">Профиль не найден</Alert>
  }

  return (
    <Box maxWidth="md" mx="auto">
      {/* Profile header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <UserAvatar
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                size={80}
                sx={{ fontSize: '1.75rem' }}
              />
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {profile.name}
                </Typography>
                {profile.city && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{profile.city}</Typography>
                  </Box>
                )}
                {profile.age && (
                  <Typography variant="body2" color="text.secondary">
                    {profile.age} лет
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {isOwnProfile ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditStart}
                >
                  Редактировать
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => addContactMutation.mutate()}
                    disabled={addContactMutation.isPending}
                  >
                    Добавить в контакты
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<FlagIcon />}
                    onClick={() => setComplaintDialogOpen(true)}
                    size="small"
                  >
                    Пожаловаться
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {profile.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {profile.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Edit form */}
      {editMode && isOwnProfile && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Редактирование профиля
            </Typography>
            <Box component="form" onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField {...register('name')} label="Имя" fullWidth size="small" error={!!errors.name} helperText={errors.name?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField {...register('city')} label="Город" fullWidth size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField {...register('age')} label="Возраст" type="number" fullWidth size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField {...register('phone')} label="Телефон" fullWidth size="small" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    {...register('description')}
                    label="О себе"
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                  />
                </Grid>

                {/* Sports */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Виды спорта
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => appendSport({ sport: 'FOOTBALL', level: 5 })}
                    >
                      Добавить
                    </Button>
                  </Box>

                  {sportFields.map((field, index) => (
                    <Box key={field.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                      <Controller
                        name={`sports.${index}.sport`}
                        control={control}
                        render={({ field: f }) => (
                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Спорт</InputLabel>
                            <Select {...f} label="Спорт">
                              {ALL_SPORTS.map((s) => (
                                <MenuItem key={s} value={s}>{SPORT_LABELS[s]}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Уровень: {sportFields[index] ? 5 : 5}
                        </Typography>
                        <Controller
                          name={`sports.${index}.level`}
                          control={control}
                          render={({ field: f }) => (
                            <Slider
                              value={f.value}
                              onChange={(_, val) => f.onChange(val)}
                              min={1}
                              max={10}
                              marks
                              step={1}
                              valueLabelDisplay="auto"
                              size="small"
                            />
                          )}
                        />
                      </Box>
                      <IconButton size="small" onClick={() => removeSport(index)} sx={{ mt: 0.5 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={() => setEditMode(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Sports */}
      {profile.sports && profile.sports.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Виды спорта
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile.sports.map((s) => (
                <Box key={s.sport} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <SportChip sport={s.sport} />
                  <Chip label={`Уровень ${s.level}`} size="small" variant="outlined" />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Rating */}
      {rating && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Рейтинг
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <RatingCard label="Навыки" avg={rating.skillRatingAvg} count={rating.skillRatingCount} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <RatingCard label="Поведение" avg={rating.behaviorRatingAvg} count={rating.behaviorRatingCount} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <RatingCard label="Надёжность" avg={rating.reliabilityRatingAvg} count={rating.reliabilityRatingCount} />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Отзывы ({reviews.length})
            </Typography>
            <List disablePadding>
              {reviews.map((review, index) => (
                <React.Fragment key={review.id}>
                  {index > 0 && <Divider sx={{ my: 1.5 }} />}
                  <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Chip
                        size="small"
                        label={
                          review.reviewType === 'SKILL'
                            ? 'Навыки'
                            : review.reviewType === 'BEHAVIOR'
                            ? 'Поведение'
                            : 'Надёжность'
                        }
                      />
                    </Box>
                    {review.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {review.comment}
                      </Typography>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Complaint dialog */}
      <Dialog open={complaintDialogOpen} onClose={() => setComplaintDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Пожаловаться на пользователя</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Тип жалобы</InputLabel>
            <Select
              value={complaintType}
              label="Тип жалобы"
              onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
            >
              {COMPLAINT_TYPES.map((ct) => (
                <MenuItem key={ct.value} value={ct.value}>{ct.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Описание"
            multiline
            rows={4}
            fullWidth
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Опишите ситуацию..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setComplaintDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => complaintMutation.mutate()}
            disabled={!complaintText.trim() || complaintMutation.isPending}
          >
            Отправить жалобу
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
