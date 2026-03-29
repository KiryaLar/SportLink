import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Skeleton,
  Alert,
  Divider,
  Drawer,
} from '@mui/material';
import {
  LocationOn,
  SportsSoccer,
  Tennis,
  SportsBasketball,
  SportsVolleyball,
  FilterList,
  MyLocation,
  AddLocation,
  Close,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import sportsPlacesApi from '../../api/sports-places.api';
import type { SportsPlace, SportsPlaceType } from '../../types/sports-places.types';

// Исправление иконок Leaflet для Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Кастомные иконки для разных видов спорта
const createSportIcon = (sport: string) => {
  const colors: Record<string, string> = {
    FOOTBALL: '#4CAF50',
    TENNIS: '#FF9800',
    BASKETBALL: '#F44336',
    VOLLEYBALL: '#2196F3',
    HOCKEY: '#00BCD4',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[sport] || '#9E9E9E'};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">
        ${sport[0]}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const SPORT_OPTIONS = [
  { value: '', label: 'Все виды' },
  { value: 'FOOTBALL', label: 'Футбол' },
  { value: 'TENNIS', label: 'Теннис' },
  { value: 'BASKETBALL', label: 'Баскетбол' },
  { value: 'VOLLEYBALL', label: 'Волейбол' },
  { value: 'HOCKEY', label: 'Хоккей' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'FREE', label: 'Бесплатные' },
  { value: 'PAID', label: 'Платные' },
];

// Компонент для обновления центра карты
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export const PlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<SportsPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SportsPlace | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Фильтры
  const [filters, setFilters] = useState({
    sport: '',
    placeType: '' as SportsPlaceType | '',
  });

  // Центр карты (Москва по умолчанию)
  const [mapCenter, setMapCenter] = useState<[number, number]>([55.7558, 37.6173]);
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sportsPlacesApi.getAllPlaces();
      setPlaces(data);
    } catch (err) {
      setError('Не удалось загрузить площадки. Попробуйте позже.');
      console.error('Failed to fetch places:', err);
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
      if (filters.placeType) filterParams.placeType = filters.placeType;

      const data = await sportsPlacesApi.searchPlaces(filterParams);
      setPlaces(data);
    } catch (err) {
      setError('Ошибка при фильтрации площадок');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ sport: '', placeType: '' });
    fetchPlaces();
  };

  const handlePlaceClick = (place: SportsPlace) => {
    setSelectedPlace(place);
    setMapCenter([place.latitude, place.longitude]);
    setDrawerOpen(true);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setMapCenter(newCenter);
          setZoom(14);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Не удалось определить местоположение');
        }
      );
    }
  };

  const getTypeLabel = (type: SportsPlaceType) => {
    return type === 'FREE' ? 'Бесплатно' : 'Платно';
  };

  const getTypeColor = (type: SportsPlaceType) => {
    return type === 'FREE' ? 'success' : 'warning';
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'FOOTBALL':
        return <SportsSoccer />;
      case 'TENNIS':
        return <Tennis />;
      case 'BASKETBALL':
        return <SportsBasketball />;
      case 'VOLLEYBALL':
        return <SportsVolleyball />;
      default:
        return <LocationOn />;
    }
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Спортивные площадки
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Найдите подходящую площадку для занятий спортом рядом с вами
        </Typography>
      </Box>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Вид спорта</InputLabel>
              <Select
                value={filters.sport}
                label="Вид спорта"
                onChange={(e) => handleFilterChange('sport', e.target.value)}
              >
                {SPORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Тип</InputLabel>
              <Select
                value={filters.placeType}
                label="Тип"
                onChange={(e) => handleFilterChange('placeType', e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={applyFilters}
            >
              Применить
            </Button>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Button fullWidth variant="text" onClick={resetFilters}>
              Сбросить
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Карта и список */}
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 300px)', minHeight: 500 }}>
        {/* Карта */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {loading ? (
              <Skeleton variant="rectangular" height="100%" />
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={mapCenter} />

                {places.map((place) => (
                  <Marker
                    key={place.id}
                    position={[place.latitude, place.longitude]}
                    icon={createSportIcon(place.supportedSports[0] || 'FOOTBALL')}
                    eventHandlers={{
                      click: () => handlePlaceClick(place),
                    }}
                  >
                    <Popup>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {place.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {place.address}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={getTypeLabel(place.placeType)}
                          color={getTypeColor(place.placeType)}
                          size="small"
                          icon={getSportIcon(place.supportedSports[0])}
                        />
                      </Box>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* Кнопка текущего местоположения */}
            <IconButton
              onClick={handleGetCurrentLocation}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'white',
                boxShadow: 2,
                '&:hover': { bgcolor: 'white' },
              }}
            >
              <MyLocation />
            </IconButton>
          </Paper>
        </Grid>

        {/* Список площадок */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              height: '100%',
              overflow: 'auto',
              p: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Площадки ({places.length})
            </Typography>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={100} />
                </Box>
              ))
            ) : places.length === 0 ? (
              <Alert severity="info">Площадки не найдены</Alert>
            ) : (
              places.map((place) => (
                <Card
                  key={place.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4, bgcolor: 'action.hover' },
                  }}
                  onClick={() => handlePlaceClick(place)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {getSportIcon(place.supportedSports[0])}
                        {place.name}
                      </Typography>
                      <Chip
                        label={getTypeLabel(place.placeType)}
                        color={getTypeColor(place.placeType)}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                    >
                      <LocationOn fontSize="small" />
                      {place.address}
                    </Typography>

                    {place.supportedSports.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {place.supportedSports.map((sport) => (
                          <Chip
                            key={sport}
                            label={sport}
                            size="small"
                            variant="outlined"
                            icon={getSportIcon(sport)}
                          />
                        ))}
                      </Box>
                    )}

                    {place.priceInfo && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        {place.priceInfo}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button size="small" onClick={() => handlePlaceClick(place)}>
                      На карте
                    </Button>
                    <Button size="small" onClick={() => {
                      // TODO: Перейти к созданию матча с этой площадкой
                    }}>
                      Выбрать
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Drawer с деталями площадки */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 400 } }}
      >
        {selectedPlace && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">{selectedPlace.name}</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Box>

            <Chip
              label={getTypeLabel(selectedPlace.placeType)}
              color={getTypeColor(selectedPlace.placeType)}
              sx={{ mb: 2 }}
            />

            {selectedPlace.description && (
              <Typography variant="body1" paragraph>
                {selectedPlace.description}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Адрес
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedPlace.address}
            </Typography>

            {selectedPlace.supportedSports.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Виды спорта
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {selectedPlace.supportedSports.map((sport) => (
                    <Chip
                      key={sport}
                      label={sport}
                      icon={getSportIcon(sport)}
                      size="small"
                    />
                  ))}
                </Box>
              </>
            )}

            {selectedPlace.priceInfo && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Стоимость
                </Typography>
                <Typography variant="body2" color="primary" paragraph>
                  {selectedPlace.priceInfo}
                </Typography>
              </>
            )}

            {selectedPlace.workingHours && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Время работы
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedPlace.workingHours}
                </Typography>
              </>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddLocation />}
                onClick={() => {
                  setDrawerOpen(false);
                  // TODO: Перейти к созданию матча
                }}
              >
                Создать матч здесь
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Container>
  );
};

export default PlacesPage;
