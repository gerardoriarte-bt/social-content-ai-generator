import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  CloudDone as CloudDoneIcon,
} from '@mui/icons-material';

interface GeminiStatusBannerProps {
  className?: string;
}

export const GeminiStatusBanner: React.FC<GeminiStatusBannerProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'high-demand' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkGeminiStatus = async () => {
    try {
      setIsChecking(true);
      setStatus('checking');
      
      const response = await fetch('/api/gemini-status');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'connected') {
          setStatus('connected');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
      
      setLastChecked(new Date());
    } catch (error) {
      setStatus('error');
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkGeminiStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkGeminiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <ScheduleIcon />;
      case 'connected':
        return <CheckCircleIcon />;
      case 'high-demand':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'info';
      case 'connected':
        return 'success';
      case 'high-demand':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Verificando estado de Gemini AI...';
      case 'connected':
        return 'Gemini AI está disponible y funcionando correctamente';
      case 'high-demand':
        return 'Gemini AI está experimentando alta demanda. Las ideas de respaldo estarán disponibles.';
      case 'error':
        return 'Gemini AI no está disponible. Se usarán ideas de respaldo de alta calidad.';
      default:
        return 'Verificando estado...';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'checking':
        return 'Verificando Conexión';
      case 'connected':
        return 'Gemini AI Conectado';
      case 'high-demand':
        return 'Alta Demanda Detectada';
      case 'error':
        return 'Servicio No Disponible';
      default:
        return 'Verificando Estado';
    }
  };

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diff < 60) return 'hace unos segundos';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
    return `hace ${Math.floor(diff / 3600)} horas`;
  };

  return (
    <Box className={className}>
      <Alert
        severity={getStatusColor() as any}
        icon={getStatusIcon()}
        sx={{
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {status === 'connected' && (
              <Chip
                icon={<CloudDoneIcon />}
                label="Operacional"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
            <Tooltip title="Verificar estado nuevamente">
              <IconButton
                size="small"
                onClick={checkGeminiStatus}
                disabled={isChecking}
                sx={{ ml: 1 }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {getStatusTitle()}
            </Typography>
            <Typography variant="body2">
              {getStatusMessage()}
            </Typography>
            {lastChecked && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Última verificación: {formatLastChecked()}
              </Typography>
            )}
          </Box>
          
          {isChecking && (
            <Box sx={{ width: 100, ml: 2 }}>
              <LinearProgress size="small" />
            </Box>
          )}
        </Box>
      </Alert>
    </Box>
  );
};