import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home,
  SportsSoccer,
  LocationOn,
  People,
  Chat,
  Notifications,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useMediaQuery('(min-width:600px)');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('ADMIN');

  const menuItems = [
    { text: 'Главная', icon: <Home />, path: '/' },
    { text: 'Матчи', icon: <SportsSoccer />, path: '/matches' },
    { text: 'Площадки', icon: <LocationOn />, path: '/places' },
    { text: 'Игроки', icon: <People />, path: '/players' },
    { text: 'Чаты', icon: <Chat />, path: '/chats' },
    { text: 'Уведомления', icon: <Notifications />, path: '/notifications' },
  ];

  if (isAdmin) {
    menuItems.push({
      text: 'Админ-панель',
      icon: <AdminPanelSettings />,
      path: '/admin',
    });
  }

  const handleNavigate = (path: string) => {
    navigate(path);
    if (!theme) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={theme ? 'permanent' : 'temporary'}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
