import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { IdeaService } from '../services/ideaService';
import { CompanyService } from '../services/companyService';
import { AIParamsForm } from './AIParamsForm';
import { ContentIdea, Company, BusinessLine, AIParams } from '../types';

interface IdeaGeneratorProps {
  company: Company;
  businessLine: BusinessLine;
  onIdeasGenerated?: (ideas: ContentIdea[]) => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ 
  company, 
  businessLine, 
  onIdeasGenerated 
}) => {
  const [numberOfIdeas, setNumberOfIdeas] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<'checking' | 'connected' | 'high-demand' | 'error'>('checking');
  const [aiParams, setAiParams] = useState<AIParams | null>(null);
  const [showAIParamsForm, setShowAIParamsForm] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);

  // Test Gemini connection and load AI params on component mount
  React.useEffect(() => {
    const initialize = async () => {
      try {
        setGeminiStatus('checking');
        
        // Test Gemini connection
        const connected = await IdeaService.testGeminiConnection();
        setIsGeminiConnected(connected);
        
        if (connected) {
          setGeminiStatus('connected');
        } else {
          setGeminiStatus('error');
        }

        // Load AI params
        const params = await CompanyService.getAIParams(company.id, businessLine.id);
        setAiParams(params);
      } catch (error) {
        console.error('Error initializing:', error);
        setGeminiStatus('error');
        // Set as connected by default to allow users to try
        setIsGeminiConnected(true);
      }
    };
    initialize();
  }, [company.id, businessLine.id]);

  const handleGenerateIdeas = async () => {
    if (!aiParams) {
      setError('AI parameters not found for this business line');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeminiStatus('checking');

    try {
      const ideas = await IdeaService.generateIdeas(company.id, businessLine.id, numberOfIdeas);
      setGeneratedIdeas(ideas);
      onIdeasGenerated?.(ideas);
      setGeminiStatus('connected');
    } catch (error) {
      console.error('Error generating ideas:', error);
      
      // Handle specific Gemini errors
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('high demand')) {
          setGeminiStatus('high-demand');
          setError('Gemini AI está experimentando alta demanda. Se han generado ideas de respaldo de alta calidad.');
        } else if (error.message.includes('429')) {
          setGeminiStatus('high-demand');
          setError('Se ha excedido el límite de solicitudes. Se han generado ideas de respaldo de alta calidad.');
        } else {
          setGeminiStatus('error');
          setError(`Error al generar ideas: ${error.message}`);
        }
      } else {
        setGeminiStatus('error');
        setError('Error inesperado al generar ideas. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIParamsSave = (savedParams: AIParams) => {
    setAiParams(savedParams);
    setError(null);
    setShowAIParamsForm(false);
  };

  const getStatusIcon = () => {
    switch (geminiStatus) {
      case 'checking':
        return <ScheduleIcon sx={{ color: 'warning.main' }} />;
      case 'connected':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'high-demand':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <ScheduleIcon sx={{ color: 'warning.main' }} />;
    }
  };

  const getStatusText = () => {
    switch (geminiStatus) {
      case 'checking':
        return 'Verificando conexión con Gemini AI...';
      case 'connected':
        return 'Gemini AI Conectado ✅';
      case 'high-demand':
        return 'Gemini AI con alta demanda ⚠️';
      case 'error':
        return 'Error de conexión con Gemini AI ❌';
      default:
        return 'Verificando conexión...';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Generate Content Ideas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Create amazing content ideas for {businessLine.name} at {company.name}
        </Typography>
        
        {/* Gemini Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          {getStatusIcon()}
          <Typography variant="body2" color="text.secondary">
            {getStatusText()}
          </Typography>
        </Box>
      </Box>

      {/* Main Generator Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Left Column - Controls */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Generation Settings
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Number of Ideas</InputLabel>
                  <Select
                    value={numberOfIdeas}
                    label="Number of Ideas"
                    onChange={(e) => setNumberOfIdeas(Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <MenuItem value={1}>1 idea</MenuItem>
                    <MenuItem value={3}>3 ideas</MenuItem>
                    <MenuItem value={5}>5 ideas</MenuItem>
                    <MenuItem value={7}>7 ideas</MenuItem>
                    <MenuItem value={10}>10 ideas</MenuItem>
                  </Select>
                </FormControl>

                {/* AI Parameters Status */}
                {!aiParams ? (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      No AI parameters found for this business line
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => setShowAIParamsForm(true)}
                      sx={{ mt: 1 }}
                    >
                      Configure AI Parameters
                    </Button>
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      AI Parameters Configured
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={aiParams.tone} size="small" />
                      <Chip label={aiParams.characterType} size="small" />
                      <Chip label={aiParams.socialNetwork} size="small" />
                    </Box>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => setShowAIParamsForm(true)}
                      sx={{ mt: 1 }}
                    >
                      Edit Parameters
                    </Button>
                  </Alert>
                )}

                {/* High Demand Warning */}
                {geminiStatus === 'high-demand' && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      Gemini AI está experimentando alta demanda. Puedes intentar generar ideas, 
                      pero es posible que falle temporalmente.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                      No te preocupes: Si Gemini AI no está disponible, el sistema generará 
                      automáticamente ideas de respaldo de alta calidad basadas en tus parámetros.
                    </Typography>
                  </Alert>
                )}

                {/* Generate Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating || !aiParams}
                  startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                  sx={{ py: 1.5 }}
                >
                  {isGenerating ? 'Generating Ideas...' : 'Generate Ideas'}
                </Button>
              </Box>
            </Grid>

            {/* Right Column - Company Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Context Information
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {company.description}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Business Line
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {businessLine.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {businessLine.description}
                  </Typography>
                </Box>

                {company.industry && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Industry
                      </Typography>
                      <Chip label={company.industry} size="small" color="secondary" />
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Generated Ideas */}
      {generatedIdeas.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Generated Ideas ({generatedIdeas.length})
          </Typography>
          
          <Grid container spacing={3}>
            {generatedIdeas.map((idea, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {idea.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {idea.description}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                      {idea.rationale}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {idea.hashtags.map((hashtag, tagIndex) => (
                        <Chip
                          key={tagIndex}
                          label={hashtag}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* AI Parameters Form Dialog */}
      {showAIParamsForm && (
        <AIParamsForm
          company={company}
          businessLine={businessLine}
          onSave={handleAIParamsSave}
          onCancel={() => setShowAIParamsForm(false)}
        />
      )}
    </Box>
  );
};