import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material'
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  AttachMoney as PaidIcon,
  MoneyOff as FreeIcon,
  Phone as PhoneIcon,
  Schedule as HoursIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import toast from 'react-hot-toast'
import { getPlaces, createPlace, getPlace } from '../api/places.api'
import { Sport, ALL_SPORTS, SPORT_LABELS, PlaceType } from '../types'
import SportChip from '../components/common/SportChip'
import StatusBadge from '../components/common/StatusBadge'
import EmptyState from '../components/common/EmptyState'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createPlaceSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  address: z.string().min(5, 'Укажите полный адрес'),
  latitude: z.number({ coerce: true }),
  longitude: z.number({ coerce: true }),
  placeType: z.enum(['FREE', 'PAID'] as const),
  description: z.string().optional(),
  priceInfo: z.string().optional(),
  workingHours: z.string().optional(),
  contactInfo: z.string().optional(),
  supportedSports: z.array(z.string()).min(1, 'Выберите хотя бы один вид спорта'),
})

type CreatePlaceForm = z.infer<typeof createPlaceSchema>

function PlaceDetailDialog({
  placeId,
  open,
  onClose,
}: {
  placeId: string | null
  open: boolean
  onClose: () => void
}) {
  const { data: place, isLoading } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => getPlace(placeId!),
    enabled: !!placeId && open,
  })

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isLoading ? <Skeleton width={200} /> : place?.name ?? 'Площадка'}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <>
            <Skeleton height={20} sx={{ mb: 1 }} />
            <Skeleton height={20} width="60%" />
          </>
        ) : place ? (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={place.placeType === 'FREE' ? 'Бесплатно' : 'Платно'}
                color={place.placeType === 'FREE' ? 'success' : 'warning'}
                size="small"
              />
              <StatusBadge status={place.status} type="place" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
              <LocationIcon color="action" sx={{ mt: 0.25, fontSize: 18 }} />
              <Typography variant="body2">{place.address}</Typography>
            </Box>

            {place.workingHours && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                <HoursIcon color="action" sx={{ mt: 0.25, fontSize: 18 }} />
                <Typography variant="body2">{place.workingHours}</Typography>
              </Box>
            )}

            {place.contactInfo && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                <PhoneIcon color="action" sx={{ mt: 0.25, fontSize: 18 }} />
                <Typography variant="body2">{place.contactInfo}</Typography>
              </Box>
            )}

            {place.priceInfo && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Стоимость
                </Typography>
                <Typography variant="body2">{place.priceInfo}</Typography>
              </Box>
            )}

            {place.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Описание
                </Typography>
                <Typography variant="body2">{place.description}</Typography>
              </Box>
            )}

            {place.supportedSports.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Виды спорта
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {place.supportedSports.map((sport) => (
                    <SportChip key={sport} sport={sport} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  )
}

function AddPlaceDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreatePlaceForm>({
    resolver: zodResolver(createPlaceSchema),
    defaultValues: {
      placeType: 'FREE',
      supportedSports: [],
      latitude: 55.75,
      longitude: 37.62,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CreatePlaceForm) =>
      createPlace({
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        placeType: data.placeType as PlaceType,
        description: data.description,
        priceInfo: data.priceInfo,
        workingHours: data.workingHours,
        contactInfo: data.contactInfo,
        supportedSports: data.supportedSports as Sport[],
      }),
    onSuccess: () => {
      toast.success('Площадка добавлена на проверку!')
      queryClient.invalidateQueries({ queryKey: ['places'] })
      onClose()
      reset()
    },
    onError: () => toast.error('Не удалось добавить площадку'),
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить площадку</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('name')}
            label="Название"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            size="small"
          />
          <TextField
            {...register('address')}
            label="Адрес"
            fullWidth
            error={!!errors.address}
            helperText={errors.address?.message}
            size="small"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                {...register('latitude')}
                label="Широта"
                type="number"
                fullWidth
                size="small"
                error={!!errors.latitude}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                {...register('longitude')}
                label="Долгота"
                type="number"
                fullWidth
                size="small"
                error={!!errors.longitude}
              />
            </Grid>
          </Grid>

          <Controller
            name="placeType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Тип площадки</InputLabel>
                <Select {...field} label="Тип площадки">
                  <MenuItem value="FREE">Бесплатная</MenuItem>
                  <MenuItem value="PAID">Платная</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="supportedSports"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={ALL_SPORTS}
                getOptionLabel={(s) => SPORT_LABELS[s as Sport]}
                value={field.value as Sport[]}
                onChange={(_, val) => field.onChange(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Виды спорта"
                    size="small"
                    error={!!errors.supportedSports}
                    helperText={errors.supportedSports?.message}
                  />
                )}
              />
            )}
          />

          <TextField
            {...register('workingHours')}
            label="Часы работы"
            fullWidth
            size="small"
            placeholder="Пн-Пт 8:00–22:00"
          />
          <TextField
            {...register('contactInfo')}
            label="Контакты"
            fullWidth
            size="small"
          />
          <TextField
            {...register('priceInfo')}
            label="Информация о стоимости"
            fullWidth
            size="small"
          />
          <TextField
            {...register('description')}
            label="Описание"
            multiline
            rows={3}
            fullWidth
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit((data) => mutation.mutate(data))}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Добавление...' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function PlacesPage() {
  const [selectedType, setSelectedType] = useState<PlaceType | ''>('')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const { data: places, isLoading, error } = useQuery({
    queryKey: ['places'],
    queryFn: getPlaces,
  })

  const filteredPlaces = (places ?? []).filter((p) => {
    if (selectedType && p.placeType !== selectedType) return false
    return true
  })

  const handlePlaceClick = (id: string) => {
    setSelectedPlaceId(id)
    setDetailDialogOpen(true)
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 128px)', gap: 0, overflow: 'hidden' }}>
      {/* Left: places list */}
      <Box
        sx={{
          width: { xs: '100%', md: '40%' },
          display: 'flex',
          flexDirection: 'column',
          pr: { md: 2 },
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Площадки
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Добавить
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Тип</InputLabel>
            <Select
              value={selectedType}
              label="Тип"
              onChange={(e) => setSelectedType(e.target.value as PlaceType | '')}
            >
              <MenuItem value="">Все типы</MenuItem>
              <MenuItem value="FREE">Бесплатные</MenuItem>
              <MenuItem value="PAID">Платные</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>Ошибка загрузки площадок</Alert>}

          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={100} sx={{ mb: 1, borderRadius: 2 }} />
            ))
          ) : filteredPlaces.length === 0 ? (
            <EmptyState
              title="Площадок не найдено"
              description="Добавьте первую спортивную площадку"
              action={{ label: 'Добавить', onClick: () => setAddDialogOpen(true) }}
            />
          ) : (
            filteredPlaces.map((place) => (
              <Card
                key={place.id}
                sx={{
                  mb: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: highlightedId === place.id ? '2px solid' : '1px solid',
                  borderColor: highlightedId === place.id ? 'primary.main' : 'transparent',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() => handlePlaceClick(place.id)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1, pr: 1 }}>
                      {place.name}
                    </Typography>
                    <Chip
                      icon={place.placeType === 'FREE' ? <FreeIcon /> : <PaidIcon />}
                      label={place.placeType === 'FREE' ? 'Бесплатно' : 'Платно'}
                      size="small"
                      color={place.placeType === 'FREE' ? 'success' : 'warning'}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <LocationIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" noWrap>
                      {place.address}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusBadge status={place.status} type="place" />
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Box>

      {/* Right: map */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          flex: 1,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <MapContainer
          center={[55.75, 37.62]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={new Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              })}
              eventHandlers={{
                click: () => {
                  setHighlightedId(place.id)
                  handlePlaceClick(place.id)
                },
              }}
            >
              <Popup>
                <Typography variant="subtitle2" fontWeight={600}>
                  {place.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {place.address}
                </Typography>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Dialogs */}
      <PlaceDetailDialog
        placeId={selectedPlaceId}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false)
          setHighlightedId(null)
        }}
      />
      <AddPlaceDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />
    </Box>
  )
}
