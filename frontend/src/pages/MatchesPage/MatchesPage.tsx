import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import {
  SportsSoccer,
  Tennis,
  SportsBasketball,
  SportsVolleyball,
  FilterList,
  Add,
  LocationOn,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import matchesApi from '../../api/matches.api';
import type { Match, MatchStatus } from '../../types/matches.types';

const SPORT_OPTIONS = [
  { value: 'FOOTBALL', label: 'Футбол', icon: <SportsSoccer /> },
  { value: 'TENNIS', label: 'Теннис', icon: <Tennis /> },
  { value: 'BASKETBALL', label: 'Баскетбол', icon: <SportsBasketball /> },
  { value: 'VOLLEYBALL', label: 'Волейбол', icon: <SportsVolleyball /> },
];

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Открыт' },
  { value: 'READY', label: 'Готов' },
  { value: 'IN_PROGRESS', label: 'В процессе' },
  { value: 'FINISHED', label: 'Завершён' },
  { value: 'CANCELLED', label: 'Отменён' },
];

export const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры
  const [filters, setFilters] = useState({
    sport: '',
    status: 'OPEN' as MatchStatus | '',
    dateFrom: '',
    dateTo: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchesApi.getAllMatches();
      setMatches(data);
    } catch (err) {
      setError('Не удалось загрузить матчи. Попробуйте позже.');
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const filterParams: Record<string, string | undefined> = {};
      if (filters.sport) filterParams.sport = filters.sport;
      if (filters.status) filterParams.status = filters.status;
      if (filters.dateFrom) filterParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) filterParams.dateTo = filters.dateTo;

      const data = await matchesApi.searchMatches(filterParams);
      setMatches(data);
      setShowFilters(false);
    } catch (err) {
      setError('Ошибка при фильтрации матчей');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      sport: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
    fetchMatches();
    setShowFilters(false);
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case 'OPEN':
        return 'success';
      case 'READY':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'FINISHED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSportIcon = (sport: string) => {
    const option = SPORT_OPTIONS.find((opt) => opt.value === sport);
    return option?.icon || <SportsSoccer />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Заголовок и кнопки */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Матчи
          </Typography>

          <Box>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            >
              <FilterList />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/matches/create')}
            >
              Создать матч
            </Button>
          </Box>
        </Box>

        {/* Фильтры */}
        {showFilters && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Вид спорта</InputLabel>
                  <Select
                    value={filters.sport}
                    label="Вид спорта"
                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Все виды</em>
                    </MenuItem>
                    {SPORT_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={filters.status}
                    label="Статус"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Все статусы</em>
                    </MenuItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="С даты"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="По дату"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={resetFilters}>Сбросить</Button>
                  <Button variant="contained" onClick={applyFilters}>
                    Применить
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Список матчей */}
        <Grid container spacing={3}>
          {loading
            ? // Skeleton загрузка
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                      <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : matches.length === 0
            ? // Нет матчей
              <Grid item xs={12}>
                <Alert severity="info">
                  Матчи не найдены. Создайте первый матч!
                </Alert>
              </Grid>
            : // Список матчей
              matches.map((match) => (
                <Grid item xs={12} sm={6} md={4} key={match.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6 },
                    }}
                    onClick={() => navigate(`/matches/${match.id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getSportIcon(match.sport)}
                          <Typography variant="h6" component="h2">
                            {match.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={STATUS_OPTIONS.find((s) => s.value === match.status)?.label}
                          color={getStatusColor(match.status)}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {match.description || 'Описание отсутствует'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(match.scheduledAt)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">Площадка #{match.sportsPlaceId}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          {match.currentParticipants} / {match.maxParticipants} участников
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/matches/${match.id}`);
                        }}
                      >
                        Подробнее
                      </Button>
                      {match.status === 'OPEN' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Присоединиться к матчу
                          }}
                        >
                          Присоединиться
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default MatchesPage;
