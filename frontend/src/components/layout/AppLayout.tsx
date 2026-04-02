import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import { getCount } from '../../api/notifications.api'
import Sidebar from './Sidebar'
import MobileBottomNav from './MobileBottomNav'

const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 72

const PAGE_TITLES: Record<string, string> = {
  '/': 'Главная',
  '/matches': 'Матчи',
  '/matches/create': 'Создать матч',
  '/places': 'Площадки',
  '/players': 'Игроки',
  '/chats': 'Сообщения',
  '/notifications': 'Уведомления',
  '/profile': 'Профиль',
  '/admin': 'Администрирование',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/matches/')) return 'Матч'
  if (pathname.startsWith('/places/')) return 'Площадка'
  if (pathname.startsWith('/profile/')) return 'Профиль игрока'
  if (pathname.startsWith('/admin')) return 'Администрирование'
  return 'SportLink'
}

export default function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)

  const { data: notifCount } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: getCount,
    refetchInterval: 30000,
  })

  const unreadCount = notifCount?.unreadCount ?? 0

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(e.currentTarget)
  }
  const handleUserMenuClose = () => setUserMenuAnchor(null)

  const handleLogout = () => {
    logout()
    handleUserMenuClose()
    navigate('/login')
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar (desktop only) */}
      {!isMobile && (
        <Sidebar
          width={sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}
          collapsed={sidebarCollapsed}
          unreadNotifications={unreadCount}
        />
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer - 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            ml: isMobile ? 0 : `${sidebarWidth}px`,
            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar sx={{ height: 64, px: { xs: 2, md: 3 } }}>
            {!isMobile && (
              <IconButton
                onClick={toggleSidebar}
                sx={{ mr: 2, color: 'text.secondary' }}
                size="small"
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1.0625rem',
              }}
            >
              {getPageTitle(location.pathname)}
            </Typography>

            <IconButton sx={{ color: 'text.secondary', mr: 1 }} size="small">
              <SearchIcon />
            </IconButton>

            <IconButton
              sx={{ color: 'text.secondary', mr: 1 }}
              size="small"
              onClick={() => navigate('/notifications')}
            >
              <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error" max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleUserMenuOpen} size="small" sx={{ p: 0.5 }}>
              <Avatar
                src={user?.avatarUrl}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* User dropdown menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { mt: 1, minWidth: 180, borderRadius: 2 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {user?.name ?? 'Пользователь'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              handleUserMenuClose()
              navigate('/profile')
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Мой профиль
          </MenuItem>
          {isAdmin && (
            <MenuItem
              onClick={() => {
                handleUserMenuClose()
                navigate('/admin')
              }}
            >
              <ListItemIcon>
                <AdminIcon fontSize="small" />
              </ListItemIcon>
              Администрирование
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Выйти
          </MenuItem>
        </Menu>

        {/* Page content */}
        <Box
          sx={{
            flexGrow: 1,
            mt: '64px',
            pb: isMobile ? 8 : 3,
            px: { xs: 2, md: 3 },
            pt: 3,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav unreadChats={unreadCount} />}
    </Box>
  )
}
