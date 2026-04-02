import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { SentimentDissatisfied as EmptyIcon } from '@mui/icons-material'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          color: 'text.disabled',
        }}
      >
        {icon ?? <EmptyIcon sx={{ fontSize: 40 }} />}
      </Box>
      <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" maxWidth={360} sx={{ mb: action ? 3 : 0 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="contained" onClick={action.onClick} sx={{ mt: description ? 0 : 2 }}>
          {action.label}
        </Button>
      )}
    </Box>
  )
}
