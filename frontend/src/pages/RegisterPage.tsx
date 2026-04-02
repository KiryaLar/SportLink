import React from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  SportsSoccer as SportIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth.store'

const schema = z
  .object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    email: z.string().email('Некорректный email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      })
      toast.success('Регистрация прошла успешно!')
      navigate('/')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Ошибка при регистрации. Попробуйте снова.'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Left hero panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '60%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 50%, #4361EE 100%)',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(67,97,238,0.15)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(56,189,248,0.1)',
          }}
        />

        <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: 480 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4361EE, #38BDF8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto',
              boxShadow: '0 8px 32px rgba(67,97,238,0.4)',
            }}
          >
            <SportIcon sx={{ color: 'white', fontSize: 44 }} />
          </Box>

          <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, mb: 2 }}>
            SportLink
          </Typography>

          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400, mb: 3 }}>
            Присоединяйся к сообществу спортсменов
          </Typography>

          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Тысячи людей уже ищут партнёров для занятий спортом. Создай профиль и начни играть сегодня.
          </Typography>
        </Box>
      </Box>

      {/* Right registration form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
          overflowY: 'auto',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 420,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              mb: 3,
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4361EE, #38BDF8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SportIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              SportLink
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Создать аккаунт
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Заполните данные для регистрации
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register('name')}
              label="Имя"
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register('phone')}
              label="Телефон (необязательно)"
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register('password')}
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register('confirmPassword')}
              label="Подтвердите пароль"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              sx={{ mb: 3 }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mb: 2.5, py: 1.5 }}
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Уже есть аккаунт?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600} underline="hover">
                Войти
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
