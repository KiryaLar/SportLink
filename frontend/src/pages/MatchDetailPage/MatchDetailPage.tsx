import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  Skeleton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from '@mui/material';
import {
  SportsSoccer,
  Tennis,
  SportsBasketball,
  SportsVolleyball,
  LocationOn,
  CalendarToday,
  Person,
  Edit,
  Delete,
  Flag,
  CheckCircle,
  Cancel,
  EmojiEvents,
} from '@mui/icons-material';
import matchesApi from '../../api/matches.api';
import type { Match, MatchParticipant, MatchStatus } from '../../types/matches.types';
import { PostMatchReviewForm } from '../../components/rating/PostMatchReviewForm';

const STATUS_LABELS: Record<MatchStatus, string> = {
  OPEN: 'Открыт',
  READY: 'Готов',
  IN_PROGRESS: 'В процессе',
  FINISHED: 'Завершён',
  CANCELLED: 'Отменён',
};

const STATUS_COLORS: Record<MatchStatus, 'success' | 'info' | 'warning' | 'default' | 'error'> = {
  OPEN: 'success',
  READY: 'info',
  IN_PROGRESS: 'warning',
  FINISHED: 'default',
  CANCELLED: 'error',
};

const SPORT_ICONS: Record<string, React.ReactNode> = {
  FOOTBALL: <SportsSoccer />,
  TENNIS: <Tennis />,
  BASKETBALL: <SportsBasketball />,
  VOLLEYBALL: <SportsVolleyball />,
};

export const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Диалоги
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const isOrganizer = match?.organizerId === 'current-user-id'; // TODO: Получить из auth store

  useEffect(() => {
    if (id) {
      fetchMatchDetails(id);
    }
  }, [id]);

  const fetchMatchDetails = async (matchId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [matchData, participantsData] = await Promise.all([
        matchesApi.getMatchById(parseInt(matchId)),
        matchesApi.getMatchParticipants(parseInt(matchId)),
      ]);
      setMatch(matchData);
      setParticipants(participantsData);
    } catch (err) {
      setError('Не удалось загрузить информацию о матче');
      console.error('Failed to fetch match details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMatch = async () => {
    if (!id) return;
    try {
      await matchesApi.joinMatch(parseInt(id));
      setJoinDialogOpen(false);
      fetchMatchDetails(id);
    } catch (err) {
      setError('Не удалось присоединиться к матчу');
    }
  };

  const handleLeaveMatch = async () => {
    if (!id) return;
    try {
      await matchesApi.leaveMatch(parseInt(id));
      fetchMatchDetails(id);
    } catch (err) {
      setError('Не удалось покинуть матч');
    }
  };

  const handleCancelMatch = async () => {
    if (!id) return;
    try {
      await matchesApi.updateMatchStatus(parseInt(id), 'CANCELLED');
      setCancelDialogOpen(false);
      fetchMatchDetails(id);
    } catch (err) {
      setError('Не удалось отменить матч');
    }
  };

  const handleStartMatch = async () => {
    if (!id) return;
    try {
      await matchesApi.updateMatchStatus(parseInt(id), 'IN_PROGRESS');
      fetchMatchDetails(id);
    } catch (err) {
      setError('Не удалось начать матч');
    }
  };

  const handleFinishMatch = async () => {
    if (!id) return;
    try {
      await matchesApi.updateMatchStatus(parseInt(id), 'FINISHED');
      fetchMatchDetails(id);
      setReviewDialogOpen(true);
    } catch (err) {
      setError('Не удалось завершить матч');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} />
        </Box>
      </Container>
    );
  }

  if (error || !match) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Матч не найден'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Заголовок */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {SPORT_ICONS[match.sport] || <SportsSoccer />}
              <Typography variant="h4" component="h1">
                {match.title}
              </Typography>
            </Box>
            <Chip
              label={STATUS_LABELS[match.status]}
              color={STATUS_COLORS[match.status]}
              size="medium"
            />
          </Box>

          <Box>
            {isOrganizer ? (
              <>
                <Button
                  startIcon={<Edit />}
                  onClick={() => navigate(`/matches/${id}/edit`)}
                  sx={{ mr: 1 }}
                >
                  Редактировать
                </Button>
                <Button
                  startIcon={<Delete />}
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Отменить
                </Button>
              </>
            ) : (
              match.status === 'OPEN' && (
                <Button
                  variant="contained"
                  startIcon={<Person />}
                  onClick={() => setJoinDialogOpen(true)}
                >
                  Присоединиться
                </Button>
              )
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Основная информация */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1" paragraph>
                {match.description || 'Описание отсутствует'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Детали матча
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Дата и время
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(match.scheduledAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Место проведения
                      </Typography>
                      <Typography variant="body1">Площадка #{match.sportsPlaceId}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Участники
                      </Typography>
                      <Typography variant="body1">
                        {match.currentParticipants} из {match.maxParticipants}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Flag color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Уровень игроков
                      </Typography>
                      <Typography variant="body1">
                        {match.minLevel} - {match.maxLevel}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Действия для организатора */}
            {isOrganizer && match.status !== 'CANCELLED' && match.status !== 'FINISHED' && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Управление матчем
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  {match.status === 'OPEN' && (
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      onClick={handleStartMatch}
                    >
                      Начать матч
                    </Button>
                  )}
                  {match.status === 'IN_PROGRESS' && (
                    <Button
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={handleFinishMatch}
                    >
                      Завершить матч
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Отменить матч
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>

          {/* Участники */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Участники ({participants.length})
              </Typography>

              <List>
                {participants.map((participant, index) => (
                  <React.Fragment key={participant.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {participant.playerName?.[0] || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.playerName || `Игрок ${index + 1}`}
                        secondary={
                          participant.status === 'CONFIRMED'
                            ? 'Подтверждён'
                            : participant.status === 'PENDING'
                            ? 'Ожидает'
                            : participant.status
                        }
                      />
                    </ListItem>
                    {index < participants.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {participants.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Пока нет участников
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Диалог присоединения */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle>Присоединиться к матчу</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите присоединиться к матчу "{match.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleJoinMatch} variant="contained">
            Присоединиться
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отмены */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Отменить матч</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить матч? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Нет</Button>
          <Button onClick={handleCancelMatch} variant="contained" color="error">
            Да, отменить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отзыва */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
        <DialogTitle>Оценить матч</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Матч завершён! Оставьте отзывы об участниках.
          </Typography>
          <Alert severity="info">
            Перейдите на страницу профиля участников, чтобы оставить отзыв.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Закрыть</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReviewDialogOpen(false);
              navigate('/players');
            }}
          >
            К игрокам
          </Button>
        </DialogActions>
      </Dialog>

      {/* Форма отзыва после матча */}
      <PostMatchReviewForm
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        matchId={match.id}
        matchTitle={match.title}
        participants={participants}
        currentUserId="current-user-id" // TODO: Получить из auth store
      />
    </Container>
  );
};

export default MatchDetailPage;
