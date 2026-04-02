import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography, Button } from '@mui/material'
import { LockOutlined as LockIcon } from '@mui/icons-material'
import { useAuthStore } from '../../store/auth.store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore()

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={48} thickness={4} />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <LockIcon sx={{ fontSize: 40, color: 'error.main' }} />
        </Box>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Доступ запрещён
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={400}>
          У вас нет прав для просмотра этой страницы. Необходима роль администратора.
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()} sx={{ mt: 1 }}>
          Вернуться назад
        </Button>
      </Box>
    )
  }

  return <>{children}</>
}
