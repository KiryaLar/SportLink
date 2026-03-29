import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { SportsSoccer, LocationOn, People, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SportsSoccer sx={{ fontSize: 60 }} />,
      title: 'Найти матч',
      description: 'Создавайте и присоединяйтесь к матчам по различным видам спорта',
    },
    {
      icon: <LocationOn sx={{ fontSize: 60 }} />,
      title: 'Площадки',
      description: 'Находите спортивные площадки рядом с вами на интерактивной карте',
    },
    {
      icon: <People sx={{ fontSize: 60 }} />,
      title: 'Партнёры',
      description: 'Находите партнёров для тренировок и командных игр',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 60 }} />,
      title: 'Рейтинг',
      description: 'Получайте оценки за игры и отслеживайте свой прогресс',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          SportLink
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 8 }}
        >
          Найди партнёров для спортивных игр рядом с вами
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/matches')}
            sx={{ mr: 2 }}
          >
            Найти матч
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/places')}
          >
            Карта площадок
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
