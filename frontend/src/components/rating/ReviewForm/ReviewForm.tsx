import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import { EmojiEvents, SportsMartialArts, ThumbUp } from '@mui/icons-material';

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewFormData) => Promise<void>;
  targetUserName?: string;
  matchTitle?: string;
}

export interface ReviewFormData {
  targetUserId: string;
  matchId: number;
  reviewType: 'SKILL' | 'BEHAVIOR' | 'RELIABILITY';
  rating: number;
  skillLevel?: 'AS_EXPECTED' | 'ABOVE' | 'BELOW';
  comment?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  open,
  onClose,
  onSubmit,
  targetUserName = 'Игрок',
  matchTitle = 'Матч',
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    targetUserId: '',
    matchId: 0,
    reviewType: 'BEHAVIOR',
    rating: 0,
    skillLevel: 'AS_EXPECTED',
    comment: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        targetUserId: '',
        matchId: 0,
        reviewType: 'BEHAVIOR',
        rating: 0,
        skillLevel: 'AS_EXPECTED',
        comment: '',
      });
      onClose();
    } catch (err) {
      setError('Не удалось отправить отзыв. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReviewTypeLabel = (type: string) => {
    switch (type) {
      case 'SKILL':
        return 'Навыки';
      case 'BEHAVIOR':
        return 'Поведение';
      case 'RELIABILITY':
        return 'Надёжность';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents color="warning" />
          Оставить отзыв
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" paragraph>
          Отзыв для: <strong>{targetUserName}</strong>
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          Матч: <strong>{matchTitle}</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Тип отзыва */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Тип отзыва</InputLabel>
          <Select
            value={formData.reviewType}
            label="Тип отзыва"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                reviewType: e.target.value as ReviewFormData['reviewType'],
              }))
            }
          >
            <MenuItem value="BEHAVIOR">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThumbUp fontSize="small" />
                Спортивное поведение
              </Box>
            </MenuItem>
            <MenuItem value="SKILL">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SportsMartialArts fontSize="small" />
                Уровень навыков
              </Box>
            </MenuItem>
            <MenuItem value="RELIABILITY">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents fontSize="small" />
                Надёжность
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Рейтинг */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            Ваша оценка
          </Typography>
          <Rating
            value={formData.rating}
            onChange={(event, newValue) => {
              setFormData((prev) => ({ ...prev, rating: newValue || 0 }));
            }}
            size="large"
            precision={1}
            sx={{ fontSize: '3rem' }}
          />
          <Typography variant="body2" color="text.secondary">
            {formData.rating === 0
              ? 'Выберите оценку'
              : formData.rating <= 2
              ? 'Низкая оценка'
              : formData.rating <= 4
              ? 'Средняя оценка'
              : 'Высокая оценка'}
          </Typography>
        </Box>

        {/* Уровень навыков (только для SKILL) */}
        {formData.reviewType === 'SKILL' && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Соответствие заявленному уровню
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Уровень</InputLabel>
              <Select
                value={formData.skillLevel}
                label="Уровень"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    skillLevel: e.target.value as ReviewFormData['skillLevel'],
                  }))
                }
              >
                <MenuItem value="AS_EXPECTED">Соответствует заявленному</MenuItem>
                <MenuItem value="ABOVE">Выше заявленного</MenuItem>
                <MenuItem value="BELOW">Ниже заявленного</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        )}

        {/* Комментарий */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Комментарий (необязательно)"
          placeholder="Расскажите подробнее о впечатлении от игры..."
          value={formData.comment}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comment: e.target.value }))
          }
          sx={{ mb: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || formData.rating === 0}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;
