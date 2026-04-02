import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { getMatch, getParticipants, joinMatch, leaveMatch, updateMatchStatus, deleteMatch } from '../api/matches.api'
import { getPlace } from '../api/places.api'
import { getMatchReviews, createReview } from '../api/ratings.api'
import { useAuthStore } from '../store/auth.store'
import SportChip from '../components/common/SportChip'
import StatusBadge from '../components/common/StatusBadge'
import UserAvatar from '../components/common/UserAvatar'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { MatchStatus, ReviewType } from '../types'

const STATUS_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  OPEN: ['READY', 'CANCELLED'],
  READY: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['FINISHED', 'CANCELLED'],
  FINISHED: [],
  CANCELLED: [],
}

const STATUS_LABELS: Record<MatchStatus, string> = {
  OPEN: 'Открыт',
  READY: 'Готов',
  IN_PROGRESS: 'В процессе',
  FINISHED: 'Завершён',
  CANCELLED: 'Отменён',
}

const PARTICIPANT_STATUS_LABELS: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  PENDING: { label: 'Ожидает', color: 'warning' },
  CONFIRMED: { label: 'Подтверждён', color: 'success' },
  CANCELLED: { label: 'Отменён', color: 'error' },
  COMPLETED: { label: 'Завершён', color: 'default' },
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewType, setReviewType] = useState<ReviewType>('SKILL')
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewTargetId] = useState('')

  const { data: match, isLoading: matchLoading, error: matchError } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id!),
    enabled: !!id,
  })

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['match', id, 'participants'],
    queryFn: () => getParticipants(id!),
    enabled: !!id,
  })

  const { data: place } = useQuery({
    queryKey: ['place', match?.sportsPlaceId],
    queryFn: () => getPlace(match!.sportsPlaceId),
    enabled: !!match?.sportsPlaceId,
  })

  const { data: reviews } = useQuery({
    queryKey: ['match', id, 'reviews'],
    queryFn: () => getMatchReviews(id!),
    enabled: !!id,
  })

  const joinMutation = useMutation({
    mutationFn: () => joinMatch(id!),
    onSuccess: () => {
      toast.success('Вы присоединились к матчу!')
      queryClient.invalidateQueries({ queryKey: ['match', id] })
      queryClient.invalidateQueries({ queryKey: ['match', id, 'participants'] })
    },
    onError: () => toast.error('Не удалось присоединиться к матчу'),
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveMatch(id!),
    onSuccess: () => {
      toast.success('Вы покинули матч')
      queryClient.invalidateQueries({ queryKey: ['match', id] })
      queryClient.invalidateQueries({ queryKey: ['match', id, 'participants'] })
    },
    onError: () => toast.error('Не удалось покинуть матч'),
  })

  const statusMutation = useMutation({
    mutationFn: (status: MatchStatus) => updateMatchStatus(id!, status),
    onSuccess: () => {
      toast.success('Статус матча обновлён')
      queryClient.invalidateQueries({ queryKey: ['match', id] })
    },
    onError: () => toast.error('Не удалось обновить статус'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteMatch(id!),
    onSuccess: () => {
      toast.success('Матч удалён')
      navigate('/matches')
    },
    onError: () => toast.error('Не удалось удалить матч'),
  })

  const reviewMutation = useMutation({
    mutationFn: () =>
      createReview({
        targetUserId: reviewTargetId,
        matchId: id!,
        reviewType,
        rating: reviewRating,
        comment: reviewComment || undefined,
      }),
    onSuccess: () => {
      toast.success('Отзыв добавлен!')
      setReviewDialogOpen(false)
      setReviewComment('')
      queryClient.invalidateQueries({ queryKey: ['match', id, 'reviews'] })
    },
    onError: () => toast.error('Не удалось добавить отзыв'),
  })

  if (matchLoading) {
    return (
      <Box>
        <Skeleton width={100} height={40} sx={{ mb: 2 }} />
        <Skeleton height={120} sx={{ mb: 2, borderRadius: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (matchError || !match) {
    return (
      <Alert severity="error">
        Не удалось загрузить матч. <Button onClick={() => navigate('/matches')}>Вернуться к матчам</Button>
      </Alert>
    )
  }

  const isOrganizer = user?.id === match.organizerId
  const myParticipation = participants?.find((p) => p.userId === user?.id)
  const isParticipant = !!myParticipation
  const canJoin = !isOrganizer && !isParticipant && match.status === 'OPEN' && match.currentParticipants < match.maxParticipants
  const canLeave = isParticipant && match.status === 'OPEN'
  const canReview = match.status === 'FINISHED' && isParticipant

  const nextStatuses = STATUS_TRANSITIONS[match.status]

  const formattedDate = (() => {
    try {
      return format(new Date(match.scheduledAt), 'd MMMM yyyy, HH:mm', { locale: ru })
    } catch {
      return match.scheduledAt
    }
  })()

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/matches')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Назад к матчам
      </Button>

      {/* Hero section */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <SportChip sport={match.sport} size="medium" />
              <StatusBadge status={match.status} type="match" />
            </Box>
            {isOrganizer && (
              <Box>
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                  <MoreIcon />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                  <MenuItem onClick={() => { setMenuAnchor(null); navigate(`/matches/${id}/edit`) }}>
                    <EditIcon sx={{ mr: 1 }} fontSize="small" />
                    Редактировать
                  </MenuItem>
                  {nextStatuses.map((s) => (
                    <MenuItem
                      key={s}
                      onClick={() => {
                        setMenuAnchor(null)
                        statusMutation.mutate(s)
                      }}
                    >
                      Изменить статус: {STATUS_LABELS[s]}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem
                    onClick={() => { setMenuAnchor(null); setDeleteDialogOpen(true) }}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                    Удалить
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
            {match.title}
          </Typography>

          {match.description && (
            <Typography variant="body1" color="text.secondary">
              {match.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left column: details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Детали матча
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Дата и время
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formattedDate}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Место проведения
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {place?.name ?? 'Загрузка...'}
                    </Typography>
                    {place?.address && (
                      <Typography variant="body2" color="text.secondary">
                        {place.address}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PeopleIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Участники
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {match.currentParticipants} / {match.maxParticipants}
                    </Typography>
                  </Box>
                </Box>

                {(match.minLevel || match.maxLevel) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TrophyIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Уровень игры
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {match.minLevel && match.maxLevel
                          ? `${match.minLevel}–${match.maxLevel}`
                          : match.minLevel
                          ? `от ${match.minLevel}`
                          : `до ${match.maxLevel}`}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Организатор
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={500}
                      component={RouterLink}
                      to={`/profile/${match.organizerId}`}
                      sx={{ textDecoration: 'none', color: 'primary.main' }}
                    >
                      {isOrganizer ? 'Вы' : `Игрок #${match.organizerId.slice(0, 8)}`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Reviews */}
          {match.status === 'FINISHED' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Отзывы
                  </Typography>
                  {canReview && (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setReviewDialogOpen(true)}
                      variant="outlined"
                    >
                      Написать отзыв
                    </Button>
                  )}
                </Box>

                {!reviews || reviews.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Отзывов пока нет
                  </Typography>
                ) : (
                  <List disablePadding>
                    {reviews.map((review) => (
                      <ListItem key={review.id} disablePadding sx={{ mb: 1.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Chip label={review.reviewType === 'SKILL' ? 'Навыки' : review.reviewType === 'BEHAVIOR' ? 'Поведение' : 'Надёжность'} size="small" />
                        </Box>
                        {review.comment && (
                          <Typography variant="body2" color="text.secondary">
                            {review.comment}
                          </Typography>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right column: participants + actions */}
        <Grid item xs={12} md={4}>
          {/* Action buttons */}
          {(canJoin || canLeave) && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                {canJoin && (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                  >
                    {joinMutation.isPending ? 'Присоединение...' : 'Присоединиться'}
                  </Button>
                )}
                {canLeave && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="large"
                    onClick={() => leaveMutation.mutate()}
                    disabled={leaveMutation.isPending}
                  >
                    {leaveMutation.isPending ? 'Выход...' : 'Покинуть матч'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participants list */}
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Участники ({participants?.length ?? 0}/{match.maxParticipants})
              </Typography>

              {participantsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton width={120} height={20} />
                  </Box>
                ))
              ) : !participants || participants.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Нет участников
                </Typography>
              ) : (
                <List disablePadding>
                  {participants.map((p) => {
                    const statusCfg = PARTICIPANT_STATUS_LABELS[p.status]
                    return (
                      <ListItem
                        key={p.id}
                        disablePadding
                        sx={{ mb: 1.5 }}
                        secondaryAction={
                          <Chip label={statusCfg?.label} color={statusCfg?.color} size="small" />
                        }
                      >
                        <ListItemAvatar>
                          <UserAvatar name={p.playerName} size={36} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={p.playerName}
                          primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удалить матч?"
        message="Это действие нельзя отменить. Все данные о матче будут удалены."
        confirmLabel="Удалить"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteDialogOpen(false)}
        dangerous
        loading={deleteMutation.isPending}
      />

      {/* Review dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Написать отзыв</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Тип отзыва</InputLabel>
            <Select
              value={reviewType}
              label="Тип отзыва"
              onChange={(e) => setReviewType(e.target.value as ReviewType)}
            >
              <MenuItem value="SKILL">Навыки</MenuItem>
              <MenuItem value="BEHAVIOR">Поведение</MenuItem>
              <MenuItem value="RELIABILITY">Надёжность</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Оценка
            </Typography>
            <Rating
              value={reviewRating}
              onChange={(_, val) => setReviewRating(val ?? 5)}
              size="large"
            />
          </Box>

          <TextField
            label="Комментарий (необязательно)"
            multiline
            rows={3}
            fullWidth
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setReviewDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => reviewMutation.mutate()}
            disabled={reviewMutation.isPending}
          >
            Отправить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
