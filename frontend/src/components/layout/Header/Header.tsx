import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  SportsSoccer,
  Logout,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { useUIStore } from '../../../store/ui.store';
import { useNotificationsStore } from '../../../store/notifications.store';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const { unreadCount, fetchUnreadCount, connectWebSocket } = useNotificationsStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<null | HTMLElement>(null);

  // Подключаемся к WebSocket для уведомлений
  React.useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('sportlink_tokens');
      if (token) {
        const tokens = JSON.parse(token);
        if (tokens.accessToken) {
          connectWebSocket(tokens.accessToken);
          fetchUnreadCount();
        }
      }
    }
  }, [isAuthenticated]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleNotifications = () => {
    handleMenuClose();
    navigate('/notifications');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <SportsSoccer sx={{ mr: 1, verticalAlign: 'middle' }} />
          SportLink
        </Typography>

        {isAuthenticated && (
          <>
            <Tooltip title="Уведомления">
              <IconButton color="inherit" onClick={handleNotifMenuOpen}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Профиль">
              <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>

      {/* Профиль меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfile}>
          <Person sx={{ mr: 1 }} />
          Профиль
        </MenuItem>
        <MenuItem onClick={handleNotifications}>
          <NotificationsIcon sx={{ mr: 1 }} />
          Уведомления
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Выйти
        </MenuItem>
      </Menu>

      {/* Уведомления меню */}
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleNotifications}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="body2">
              {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Нет новых уведомлений'}
            </Typography>
            {unreadCount > 0 && (
              <Chip label={unreadCount} size="small" color="error" />
            )}
          </Box>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
