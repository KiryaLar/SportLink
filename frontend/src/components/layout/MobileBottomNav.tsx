import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material'
import {
  Dashboard as DashboardIcon,
  SportsSoccer as MatchesIcon,
  LocationOn as PlacesIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

interface MobileBottomNavProps {
  unreadChats?: number
}

const navItems = [
  { label: 'Главная', path: '/', icon: <DashboardIcon /> },
  { label: 'Матчи', path: '/matches', icon: <MatchesIcon /> },
  { label: 'Площадки', path: '/places', icon: <PlacesIcon /> },
  { label: 'Чаты', path: '/chats', icon: <ChatIcon /> },
  { label: 'Профиль', path: '/profile', icon: <PersonIcon /> },
]

export default function MobileBottomNav({ unreadChats = 0 }: MobileBottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const currentValue = navItems.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  })

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentValue === -1 ? false : currentValue}
        onChange={(_, newValue) => {
          navigate(navItems[newValue].path)
        }}
        sx={{ height: 64 }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={
              item.path === '/chats' && unreadChats > 0 ? (
                <Badge badgeContent={unreadChats} color="error" max={99}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
            sx={{
              minWidth: 0,
              fontSize: '0.6875rem',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
