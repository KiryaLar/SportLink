import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Badge,
  Drawer,
  Divider,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  SportsSoccer as MatchesIcon,
  LocationOn as PlacesIcon,
  Group as PlayersIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  badge?: number
  adminOnly?: boolean
}

interface SidebarProps {
  width: number
  collapsed: boolean
  unreadNotifications?: number
}

export default function Sidebar({ width, collapsed, unreadNotifications = 0 }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin } = useAuthStore()
  const { toggleSidebar } = useUIStore()

  const navItems: NavItem[] = [
    { label: 'Главная', path: '/', icon: <DashboardIcon /> },
    { label: 'Матчи', path: '/matches', icon: <MatchesIcon /> },
    { label: 'Площадки', path: '/places', icon: <PlacesIcon /> },
    { label: 'Игроки', path: '/players', icon: <PlayersIcon /> },
    {
      label: 'Сообщения',
      path: '/chats',
      icon: <ChatIcon />,
    },
    {
      label: 'Уведомления',
      path: '/notifications',
      icon: <NotificationsIcon />,
      badge: unreadNotifications,
    },
    { label: 'Профиль', path: '/profile', icon: <PersonIcon /> },
    {
      label: 'Администрирование',
      path: '/admin',
      icon: <AdminIcon />,
      adminOnly: true,
    },
  ]

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          backgroundColor: '#0F172A',
          borderRight: 'none',
          overflowX: 'hidden',
          transition: 'width 0.2s ease',
        },
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          px: collapsed ? 1.5 : 2.5,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0F172A 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4361EE, #38BDF8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MatchesIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        {!collapsed && (
          <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.125rem',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              SportLink
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6875rem', whiteSpace: 'nowrap' }}
            >
              Найди своих
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, py: 1.5, overflow: 'hidden' }}>
        <List disablePadding sx={{ px: collapsed ? 0.75 : 1.5 }}>
          {filteredItems.map((item) => {
            const active = isActive(item.path)
            const button = (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: collapsed ? 1.5 : 1.75,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: active ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: active ? 'primary.main' : 'rgba(255,255,255,0.06)',
                    },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      color: active ? 'white' : 'rgba(226,232,240,0.7)',
                      justifyContent: 'center',
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error" max={99}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'white' : 'rgba(226,232,240,0.85)',
                        whiteSpace: 'nowrap',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.path} title={item.label} placement="right" arrow>
                  {button}
                </Tooltip>
              )
            }

            return button
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Collapse toggle */}
      <Box sx={{ px: collapsed ? 0.75 : 1.5, py: 1.5 }}>
        <Tooltip title={collapsed ? 'Развернуть' : 'Свернуть'} placement="right">
          <ListItemButton
            onClick={toggleSidebar}
            sx={{
              borderRadius: 2,
              px: collapsed ? 1.5 : 1.75,
              minHeight: 40,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'rgba(226,232,240,0.5)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.06)',
                color: 'rgba(226,232,240,0.85)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 36,
                color: 'inherit',
                justifyContent: 'center',
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Свернуть"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  color: 'inherit',
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  )
}
