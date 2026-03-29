import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  Divider,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { EmojiEvents, SportsMartialArts, ThumbUp, Person } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import ratingApi from '../../api/rating.api';
import type { Review, UserRating } from '../../types/rating.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const REVIEW_TYPE_ICONS: Record<string, React.ReactNode> = {
  SKILL: <SportsMartialArts fontSize="small" />,
  BEHAVIOR: <ThumbUp fontSize="small" />,
  RELIABILITY: <EmojiEvents fontSize="small" />,
};

const REVIEW_TYPE_LABELS: Record<string, string> = {
  SKILL: 'Навыки',
  BEHAVIOR: 'Поведение',
  RELIABILITY: 'Надёжность',
};

const SKILL_LEVEL_COLORS: Record<string, 'success' | 'warning' | 'info'> = {
  AS_EXPECTED: 'success',
  ABOVE: 'success',
  BELOW: 'warning',
};

const SKILL_LEVEL_LABELS: Record<string, string> = {
  AS_EXPECTED: 'Соответствует',
  ABOVE: 'Выше заявленного',
  BELOW: 'Ниже заявленного',
};

export const ReviewsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<UserRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    // Если userId не указан, используем текущего пользователя
    // TODO: Получить из auth store
    const currentUserId = userId || 'current-user-id';
    fetchReviews(currentUserId);
  }, [userId]);

  const fetchReviews = async (currentUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [reviewsData, ratingData] = await Promise.all([
        ratingApi.getUserReviews(currentUserId, 0, 50),
        ratingApi.getUserRating(currentUserId),
      ]);
      setReviews(reviewsData.content);
      setRating(ratingData);
    } catch (err) {
      setError('Не удалось загрузить отзывы');
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterType(event.target.value as string);
  };

  const getFilteredReviews = () => {
    if (filterType === 'all') return reviews;
    return reviews.filter((review) => review.reviewType === filterType);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSkillLevelLabel = (level: string | null) => {
    if (!level) return '';
    return SKILL_LEVEL_LABELS[level] || level;
  };

  const getSkillLevelColor = (level: string | null) => {
    if (!level) return 'default' as const;
    return SKILL_LEVEL_COLORS[level] || 'default';
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
        <Typography variant="h4" component="h1" gutterBottom>
          Отзывы и рейтинг
        </Typography>

        {loading ? (
          <Box>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={400} />
          </Box>
        ) : (
          <>
            {/* Общий рейтинг */}
            {rating && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary">
                        {rating.skillRatingAvg > 0
                          ? rating.skillRatingAvg.toFixed(1)
                          : '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Общий рейтинг
                      </Typography>
                      <Rating
                        value={Math.round(rating.skillRatingAvg)}
                        readOnly
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <SportsMartialArts color="action" sx={{ mb: 1 }} />
                          <Typography variant="h6">
                            {rating.skillRatingAvg > 0
                              ? rating.skillRatingAvg.toFixed(1)
                              : '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Навыки
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {rating.skillRatingCount} отзывов
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <ThumbUp color="action" sx={{ mb: 1 }} />
                          <Typography variant="h6">
                            {rating.behaviorRatingAvg > 0
                              ? rating.behaviorRatingAvg.toFixed(1)
                              : '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Поведение
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {rating.behaviorRatingCount} отзывов
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <EmojiEvents color="action" sx={{ mb: 1 }} />
                          <Typography variant="h6">
                            {rating.reliabilityRatingAvg > 0
                              ? rating.reliabilityRatingAvg.toFixed(1)
                              : '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Надёжность
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {rating.reliabilityRatingCount} отзывов
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Статистика соответствия уровня */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Соответствие заявленному уровню
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Chip
                        label={`Соответствует: ${rating.skillLevelMatches}`}
                        color="success"
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Chip
                        label={`Выше: ${rating.skillLevelAbove}`}
                        color="success"
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Chip
                        label={`Ниже: ${rating.skillLevelBelow}`}
                        color="warning"
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            )}

            {/* Список отзывов */}
            <Paper>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Все отзывы" />
                  <Tab label={`Поведение (${reviews.filter(r => r.reviewType === 'BEHAVIOR').length})`} />
                  <Tab label={`Навыки (${reviews.filter(r => r.reviewType === 'SKILL').length})`} />
                  <Tab label={`Надёжность (${reviews.filter(r => r.reviewType === 'RELIABILITY').length})`} />
                </Tabs>
              </Box>

              <Box sx={{ px: 2, py: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Фильтр</InputLabel>
                  <Select value={filterType} label="Фильтр" onChange={handleFilterChange}>
                    <MenuItem value="all">Все отзывы</MenuItem>
                    <MenuItem value="BEHAVIOR">Поведение</MenuItem>
                    <MenuItem value="SKILL">Навыки</MenuItem>
                    <MenuItem value="RELIABILITY">Надёжность</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              <TabPanel value={tabValue} index={0}>
                {renderReviewsList(getFilteredReviews(), formatDate, getSkillLevelLabel, getSkillLevelColor)}
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                {renderReviewsList(
                  reviews.filter((r) => r.reviewType === 'BEHAVIOR'),
                  formatDate,
                  getSkillLevelLabel,
                  getSkillLevelColor
                )}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                {renderReviewsList(
                  reviews.filter((r) => r.reviewType === 'SKILL'),
                  formatDate,
                  getSkillLevelLabel,
                  getSkillLevelColor
                )}
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                {renderReviewsList(
                  reviews.filter((r) => r.reviewType === 'RELIABILITY'),
                  formatDate,
                  getSkillLevelLabel,
                  getSkillLevelColor
                )}
              </TabPanel>
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
};

// Helper function для рендеринга списка отзывов
const renderReviewsList = (
  reviewsList: Review[],
  formatDate: (date: string) => string,
  getSkillLevelLabel: (level: string | null) => string,
  getSkillLevelColor: (level: string | null) => 'default' | 'success' | 'warning' | 'info'
) => {
  if (reviewsList.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">Отзывов пока нет</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {reviewsList.map((review, index) => (
        <React.Fragment key={review.id}>
          <Box sx={{ py: 2 }}>
            <Grid container spacing={2}>
              <Grid item>
                <Avatar sx={{ width: 56, height: 56 }}>
                  <Person />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {REVIEW_TYPE_ICONS[review.reviewType]}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {REVIEW_TYPE_LABELS[review.reviewType]}
                  </Typography>
                  <Chip
                    label={getSkillLevelLabel(review.skillLevel)}
                    color={getSkillLevelColor(review.skillLevel)}
                    size="small"
                  />
                </Box>

                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />

                {review.comment && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {review.comment}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary">
                  {formatDate(review.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          {index < reviewsList.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default ReviewsPage;
