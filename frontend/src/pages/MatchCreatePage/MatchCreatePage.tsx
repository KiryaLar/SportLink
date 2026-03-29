import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Skeleton,
} from '@mui/material';
import { SportsSoccer, Tennis, SportsBasketball, SportsVolleyball, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import matchesApi from '../../api/matches.api';
import sportsPlacesApi from '../../api/sports-places.api';
import type { MatchCreateRequest } from '../../types/matches.types';
import type { SportsPlace } from '../../types/sports-places.types';

const SPORT_OPTIONS = [
  { value: 'FOOTBALL', label: 'Футбол', icon: <SportsSoccer /> },
  { value: 'TENNIS', label: 'Теннис', icon: <Tennis /> },
  { value: 'BASKETBALL', label: 'Баскетбол', icon: <SportsBasketball /> },
  { value: 'VOLLEYBALL', label: 'Волейбол', icon: <SportsVolleyball /> },
];

interface FormData {
  title: string;
  sport: string;
  scheduledAt: string;
  sportsPlaceId: number;
  maxParticipants: number;
  minLevel: number;
  maxLevel: number;
  description: string;
}

export const MatchCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [places, setPlaces] = useState<SportsPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      sport: '',
      scheduledAt: '',
      sportsPlaceId: 0,
      maxParticipants: 10,
      minLevel: 1,
      maxLevel: 10,
      description: '',
    },
  });

  // Загрузка площадок при монтировании
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoadingPlaces(true);
      try {
        const data = await sportsPlacesApi.getAllPlaces();
        setPlaces(data);
      } catch (err) {
        console.error('Failed to fetch places:', err);
        setError('Не удалось загрузить список площадок');
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, []);

  const steps = ['Основная информация', 'Место и время', 'Параметры матча'];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const matchData: MatchCreateRequest = {
        title: data.title,
        sport: data.sport,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        sportsPlaceId: data.sportsPlaceId,
        maxParticipants: data.maxParticipants,
        minLevel: data.minLevel,
        maxLevel: data.maxLevel,
        description: data.description || undefined,
      };

      await matchesApi.createMatch(matchData);
      navigate('/matches');
    } catch (err) {
      setError('Не удалось создать матч. Проверьте данные и попробуйте снова.');
      console.error('Failed to create match:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Название обязательно' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Название матча"
                  placeholder="Например: Футбол 5x5 в парке"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />

            <Controller
              name="sport"
              control={control}
              rules={{ required: 'Выберите вид спорта' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.sport} sx={{ mb: 3 }}>
                  <InputLabel>Вид спорта</InputLabel>
                  <Select {...field} label="Вид спорта">
                    {SPORT_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {opt.icon}
                          {opt.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.sport && (
                    <Typography color="error" variant="caption">
                      {errors.sport.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Описание"
                  multiline
                  rows={4}
                  placeholder="Опишите детали матча..."
                />
              )}
            />
          </>
        );

      case 1:
        return (
          <>
            <Controller
              name="scheduledAt"
              control={control}
              rules={{ required: 'Дата и время обязательны' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="datetime-local"
                  label="Дата и время"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.scheduledAt}
                  helperText={errors.scheduledAt?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />

            <Typography variant="subtitle2" gutterBottom>
              Спортивная площадка *
            </Typography>

            {loadingPlaces ? (
              <Skeleton variant="rectangular" height={56} sx={{ mb: 3 }} />
            ) : places.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Площадки не найдены. Сначала добавьте площадки через админ-панель.
              </Alert>
            ) : (
              <Controller
                name="sportsPlaceId"
                control={control}
                rules={{ required: 'Выберите площадку', min: { value: 1, message: 'Выберите площадку' } }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sportsPlaceId} sx={{ mb: 3 }}>
                    <InputLabel>Площадка</InputLabel>
                    <Select {...field} label="Площадка">
                      {places.map((place) => (
                        <MenuItem key={place.id} value={place.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn fontSize="small" color="action" />
                            {place.name}
                            <Chip
                              label={place.placeType === 'FREE' ? 'Бесплатно' : 'Платно'}
                              color={place.placeType === 'FREE' ? 'success' : 'warning'}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sportsPlaceId && (
                      <Typography color="error" variant="caption">
                        {errors.sportsPlaceId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              💡 Совет: Выберите подходящую площадку из списка доступных
            </Alert>
          </>
        );

      case 2:
        return (
          <>
            <Controller
              name="maxParticipants"
              control={control}
              render={({ field }) => (
                <Box sx={{ mb: 4 }}>
                  <Typography gutterBottom>
                    Максимальное количество участников: {field.value}
                  </Typography>
                  <Slider
                    {...field}
                    min={2}
                    max={50}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            />

            <Typography variant="subtitle2" gutterBottom>
              Требуемый уровень игроков
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Controller
                  name="minLevel"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Мин. уровень</InputLabel>
                      <Select {...field} label="Мин. уровень">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="maxLevel"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Макс. уровень</InputLabel>
                      <Select {...field} label="Макс. уровень">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Alert severity="info">
              Уровень: 1-3 = Новичок, 4-6 = Средний, 7-10 = Продвинутый
            </Alert>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Создать матч
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ minHeight: 300 }}>{renderStepContent(activeStep)}</Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Назад
              </Button>

              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Создание...' : 'Создать матч'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Далее
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default MatchCreatePage;
