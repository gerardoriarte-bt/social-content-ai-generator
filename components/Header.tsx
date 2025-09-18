import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  LightMode,
  DarkMode,
  AutoAwesome,
} from '@mui/icons-material';
import { authService, User } from '../services/authService';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout,
  darkMode = false, 
  onToggleDarkMode 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if server logout fails
      onLogout();
    }
    handleClose();
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo y título */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AutoAwesome sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #7c3aed, #06b6d4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 2,
            }}
          >
            Social Content AI Generator
          </Typography>
          <Chip
            label="Beta"
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>

        {/* Controles del usuario */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Toggle de modo oscuro */}
          {onToggleDarkMode && (
            <IconButton
              onClick={onToggleDarkMode}
              color="inherit"
              size="small"
              sx={{ mr: 1 }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          )}

          {/* Información del usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box sx={{ textAlign: 'right', mr: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {currentUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser.email}
              </Typography>
            </Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                src={currentUser.avatarUrl || undefined}
                sx={{
                  bgcolor: 'primary.main',
                  width: 36,
                  height: 36,
                  fontSize: '0.9rem',
                }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          {/* Menú del usuario */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <MenuItem onClick={handleClose}>
              <AccountCircle sx={{ mr: 2 }} />
              Perfil
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Settings sx={{ mr: 2 }} />
              Configuración
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};