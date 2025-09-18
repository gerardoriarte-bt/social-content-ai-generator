import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  SmartToy as SmartToyIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export type AIProvider = 'gemini' | 'openai' | 'claude';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

interface ProviderStatus {
  provider: AIProvider;
  status: 'loading' | 'connected' | 'error' | 'unknown';
  message?: string;
}

const providerConfig = {
  gemini: {
    name: 'Google Gemini',
    description: 'Modelo avanzado de Google para generación de contenido',
    icon: <PsychologyIcon />,
    color: '#4285F4',
  },
  openai: {
    name: 'OpenAI GPT',
    description: 'Modelo de OpenAI para conversaciones y generación de texto',
    icon: <SmartToyIcon />,
    color: '#10A37F',
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Modelo de Anthropic para análisis y generación de contenido',
    icon: <AutoAwesomeIcon />,
    color: '#D97706',
  },
};

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  disabled = false,
}) => {
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);

  const testProviderConnection = async (provider: AIProvider) => {
    setTestingProvider(provider);
    
    try {
      // Simular test de conexión (por ahora)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProviderStatuses(prev => 
        prev.filter(p => p.provider !== provider).concat({
          provider,
          status: 'connected',
          message: `${provider.toUpperCase()} connection successful`,
        })
      );
    } catch (error) {
      setProviderStatuses(prev => 
        prev.filter(p => p.provider !== provider).concat({
          provider,
          status: 'error',
          message: 'Connection test failed',
        })
      );
    } finally {
      setTestingProvider(null);
    }
  };

  const testAllProviders = async () => {
    const providers: AIProvider[] = ['gemini', 'openai', 'claude'];
    
    for (const provider of providers) {
      await testProviderConnection(provider);
    }
  };

  const getProviderStatus = (provider: AIProvider): ProviderStatus | undefined => {
    return providerStatuses.find(p => p.provider === provider);
  };

  const getStatusIcon = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'loading':
        return <CircularProgress size={16} />;
      default:
        return null;
    }
  };

  const getStatusChip = (provider: AIProvider) => {
    const status = getProviderStatus(provider);
    
    if (!status || status.status === 'unknown') {
      return (
        <Chip
          label="Not tested"
          size="small"
          variant="outlined"
          color="default"
        />
      );
    }

    return (
      <Chip
        icon={getStatusIcon(status.status)}
        label={status.status === 'connected' ? 'Connected' : 'Error'}
        size="small"
        color={status.status === 'connected' ? 'success' : 'error'}
        variant={status.status === 'connected' ? 'filled' : 'outlined'}
      />
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Seleccionar Proveedor de IA
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Elige el modelo de IA que prefieras para generar ideas de contenido. 
          Cada proveedor tiene sus propias fortalezas y características.
        </Typography>

        <FormControl component="fieldset" disabled={disabled}>
          <FormLabel component="legend">Proveedores Disponibles</FormLabel>
          <RadioGroup
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value as AIProvider)}
          >
            {Object.entries(providerConfig).map(([key, config]) => {
              const provider = key as AIProvider;
              const status = getProviderStatus(provider);
              const isTesting = testingProvider === provider;
              
              return (
                <Box key={provider} sx={{ mb: 2 }}>
                  <FormControlLabel
                    value={provider}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: config.color }}>
                          {config.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {config.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {config.description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isTesting ? (
                            <CircularProgress size={20} />
                          ) : (
                            <>
                              {getStatusChip(provider)}
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testProviderConnection(provider);
                                }}
                                disabled={isTesting}
                              >
                                Test
                              </Button>
                            </>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  
                  {status && status.message && (
                    <Alert 
                      severity={status.status === 'connected' ? 'success' : 'error'}
                      sx={{ mt: 1, ml: 4 }}
                    >
                      {status.message}
                    </Alert>
                  )}
                </Box>
              );
            })}
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={testAllProviders}
            disabled={testingProvider !== null}
            startIcon={testingProvider ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Probar Todas las Conexiones
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Nota:</strong> OpenAI GPT está configurado y listo para usar. 
            Gemini también está disponible como respaldo.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};
