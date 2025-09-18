import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { CompanyService } from '../services/companyService';
import type { AIParams, Company, BusinessLine } from '../types';

interface AIParamsFormProps {
  company: Company;
  businessLine: BusinessLine;
  onSave: (aiParams: AIParams) => void;
  onCancel: () => void;
}

export const AIParamsForm: React.FC<AIParamsFormProps> = ({
  company,
  businessLine,
  onSave,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiParams, setAiParams] = useState<Partial<AIParams>>({
    tone: 'Profesional y amigable',
    characterType: 'Experto en la industria',
    targetAudience: 'Clientes potenciales y existentes',
    contentType: 'Posts informativos y promocionales',
    socialNetwork: 'Instagram',
    contentFormat: 'Post',
    objective: 'Awareness',
    focus: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingParams = async () => {
      try {
        setIsLoading(true);
        const existingParams = await CompanyService.getAIParams(company.id, businessLine.id);
        if (existingParams) {
          setAiParams(existingParams);
        }
      } catch (error) {
        console.error('Error loading AI params:', error);
        // Continue with default values
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingParams();
  }, [company.id, businessLine.id]);

  const handleSave = async () => {
    if (!aiParams.tone || !aiParams.characterType || !aiParams.targetAudience) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const savedParams = await CompanyService.saveAIParams(company.id, businessLine.id, aiParams as AIParams);
      onSave(savedParams);
    } catch (error) {
      console.error('Error saving AI params:', error);
      setError(error instanceof Error ? error.message : 'Failed to save AI parameters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AIParams, value: string) => {
    setAiParams(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toneOptions = [
    'Profesional y amigable',
    'Casual y cercano',
    'Formal y técnico',
    'Divertido y entretenido',
    'Inspirador y motivacional',
    'Autoritario y directo',
  ];

  const characterOptions = [
    'Experto en la industria',
    'Consultor especializado',
    'Mentor empresarial',
    'Influencer del sector',
    'Storyteller profesional',
    'Analista de tendencias',
  ];

  const audienceOptions = [
    'Clientes potenciales y existentes',
    'Profesionales del sector',
    'Empresarios y emprendedores',
    'Jóvenes profesionales',
    'Directivos y tomadores de decisiones',
    'Consumidores finales',
  ];

  const contentOptions = [
    'Posts informativos y promocionales',
    'Contenido educativo y tutoriales',
    'Casos de éxito y testimonios',
    'Noticias y tendencias del sector',
    'Contenido interactivo y preguntas',
    'Behind the scenes y cultura empresarial',
  ];

  const socialNetworkOptions = [
    'Instagram',
    'LinkedIn',
    'Facebook',
    'Twitter',
    'TikTok',
    'YouTube',
  ];

  const formatOptions = [
    'Post',
    'Story',
    'Reel',
    'Video',
    'Carousel',
    'Live',
  ];

  const objectiveOptions = [
    'Awareness',
    'Consideration',
    'Conversion',
    'Retention',
    'Advocacy',
  ];

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Configure AI Parameters
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Customize how AI generates content for {businessLine.name} at {company.name}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Tone */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tone *</InputLabel>
              <Select
                value={aiParams.tone || ''}
                label="Tone *"
                onChange={(e) => handleInputChange('tone', e.target.value)}
              >
                {toneOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Character Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Character Type *</InputLabel>
              <Select
                value={aiParams.characterType || ''}
                label="Character Type *"
                onChange={(e) => handleInputChange('characterType', e.target.value)}
              >
                {characterOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Target Audience */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Target Audience *</InputLabel>
              <Select
                value={aiParams.targetAudience || ''}
                label="Target Audience *"
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              >
                {audienceOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Content Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={aiParams.contentType || ''}
                label="Content Type"
                onChange={(e) => handleInputChange('contentType', e.target.value)}
              >
                {contentOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Social Network */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Social Network</InputLabel>
              <Select
                value={aiParams.socialNetwork || ''}
                label="Social Network"
                onChange={(e) => handleInputChange('socialNetwork', e.target.value)}
              >
                {socialNetworkOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Content Format */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Content Format</InputLabel>
              <Select
                value={aiParams.contentFormat || ''}
                label="Content Format"
                onChange={(e) => handleInputChange('contentFormat', e.target.value)}
              >
                {formatOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Objective */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Objective</InputLabel>
              <Select
                value={aiParams.objective || ''}
                label="Objective"
                onChange={(e) => handleInputChange('objective', e.target.value)}
              >
                {objectiveOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Focus */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Focus"
              multiline
              rows={3}
              value={aiParams.focus || ''}
              onChange={(e) => handleInputChange('focus', e.target.value)}
              placeholder="Any specific topics, keywords, or themes you want the AI to focus on..."
              helperText="Optional: Specify any particular focus areas, keywords, or themes"
            />
          </Grid>
        </Grid>

        {/* Preview */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Preview Configuration
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {aiParams.tone && <Chip label={`Tone: ${aiParams.tone}`} size="small" color="primary" />}
            {aiParams.characterType && <Chip label={`Character: ${aiParams.characterType}`} size="small" color="secondary" />}
            {aiParams.socialNetwork && <Chip label={`Platform: ${aiParams.socialNetwork}`} size="small" color="success" />}
            {aiParams.objective && <Chip label={`Goal: ${aiParams.objective}`} size="small" color="warning" />}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onCancel}
          disabled={isLoading}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || !aiParams.tone || !aiParams.characterType || !aiParams.targetAudience}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};