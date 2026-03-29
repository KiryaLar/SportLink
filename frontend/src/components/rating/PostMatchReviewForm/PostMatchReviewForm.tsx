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
  Paper,
  Alert,
  Divider,
  Grid,
  Avatar,
} from '@mui/material';
import { EmojiEvents, SportsMartialArts, ThumbUp, Person } from '@mui/icons-material';
import type { MatchParticipant } from '../../types/matches.types';
import ratingApi from '../../api/rating.api';

interface PostMatchReviewFormProps {
  open: boolean;
  onClose: () => void;
  matchId: number;
  matchTitle: string;
  participants: MatchParticipant[];
  currentUserId: string;
}

interface ParticipantReview {
  participantId: string;
  participantName: string;
  reviewType: 'SKILL' | 'BEHAVIOR' | 'RELIABILITY';
  rating: number;
  skillLevel?: 'AS_EXPECTED' | 'ABOVE' | 'BELOW';
  comment?: string;
}

export const PostMatchReviewForm: React.FC<PostMatchReviewFormProps> = ({
  open,
  onClose,
  matchId,
  matchTitle,
  participants,
  currentUserId,
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [formData, setFormData] = useState<ParticipantReview>({
    participantId: '',
    participantName: '',
    reviewType: 'BEHAVIOR',
    rating: 0,
    skillLevel: 'AS_EXPECTED',
    comment: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const otherParticipants = participants.filter(
    (p) => p.userId !== currentUserId
  );

  const handleParticipantChange = (participantId: string) => {
    setSelectedParticipant(participantId);
    const participant = otherParticipants.find((p) => p.userId === participantId);
    if (participant) {
      setFormData((prev) => ({
        ...prev,
        participantId: participant.userId,
        participantName: participant.playerName || `Игрок ${participantId}`,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.participantId) {
      setError('Выберите участника');
      return;
    }

    if (formData.rating === 0) {
      setError('Поставьте оценку');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await ratingApi.createReview({
        targetUserId: formData.participantId,
        matchId,
        reviewType: formData.reviewType,
        rating: formData.rating,
        skillLevel: formData.reviewType === 'SKILL' ? formData.skillLevel : undefined,
        comment: formData.comment || undefined,
      });

      setSuccess(true);

      // Закрыть через 2 секунды
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
          participantId: '',
          participantName: '',
          reviewType: 'BEHAVIOR',
          rating: 0,
          skillLevel: 'AS_EXPECTED',
          comment: '',
        });
        setSelectedParticipant('');
      }, 2000);
    } catch (err) {
      setError('Не удалось отправить отзыв');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="success" sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <EmojiEvents sx={{ fontSize: 48 }} />
              <Typography variant="h6">Отзыв отправлен!</Typography>
              <Typography variant="body2">
                Спасибо за оценку участника
              </Typography>
            </Box>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents color="warning" />
          Оценить участников матча
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body1" paragraph>
          Матч: <strong>{matchTitle}</strong>
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          Выберите участника и оставьте отзыв о его игре
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Выбор участника */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Участник</InputLabel>
          <Select
            value={selectedParticipant}
            label="Участник"
            onChange={(e) => handleParticipantChange(e.target.value as string)}
          >
            {otherParticipants.map((participant) => (
              <MenuItem key={participant.userId} value={participant.userId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <Person />
                  </Avatar>
                  {participant.playerName || `Игрок ${participant.userId}`}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedParticipant && (
          <>
            {/* Тип отзыва */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Тип отзыва</InputLabel>
              <Select
                value={formData.reviewType}
                label="Тип отзыва"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reviewType: e.target.value as ParticipantReview['reviewType'],
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
                Оценка: {formData.participantName}
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({ ...prev, rating: newValue || 0 }));
                }}
                size="large"
                sx={{ fontSize: '3rem' }}
              />
              <Typography variant="body2" color="text.secondary">
                {formData.rating === 0
                  ? 'Выберите оценку'
                  : '★'.repeat(formData.rating) + '☆'.repeat(5 - formData.rating)}
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
                        skillLevel: e.target.value as ParticipantReview['skillLevel'],
                      }))
                    }
                  >
                    <MenuItem value="AS_EXPECTED">Соответствует</MenuItem>
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
              placeholder="Расскажите о впечатлении от игры..."
              value={formData.comment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Закрыть
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !selectedParticipant || formData.rating === 0}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostMatchReviewForm;
