import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Breadcrumbs,
  Link,
  Chip,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  AutoAwesome as AutoAwesomeIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { CompanyService } from '../services/companyService';
import type { Company, BusinessLine } from '../types';

interface BusinessLineManagerProps {
  company: Company;
  onBusinessLineSelect: (businessLine: BusinessLine) => void;
  onBusinessLinesUpdate: (updatedCompany: Company) => void;
  onBack?: () => void;
}

const AddBusinessLineCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Card
    sx={{
      height: '100%',
      minHeight: 180,
      border: '2px dashed',
      borderColor: 'grey.300',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
      '&:hover': {
        borderColor: 'secondary.main',
        backgroundColor: 'secondary.50',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(6, 182, 212, 0.15)',
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: 'secondary.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <AddIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
      </Box>
      <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 600, mb: 1 }}>
        Add Business Line
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Create content strategy
      </Typography>
    </CardContent>
  </Card>
);

export const BusinessLineManager: React.FC<BusinessLineManagerProps> = ({ 
  company, 
  onBusinessLineSelect, 
  onBusinessLinesUpdate,
  onBack 
}) => {
  const [currentCompany, setCurrentCompany] = useState<Company>(company);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BusinessLine | null>(null);
  const [lineName, setLineName] = useState('');
  const [lineDescription, setLineDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOpenModal = useCallback((line: BusinessLine | null = null) => {
    setEditingLine(line);
    setLineName(line ? line.name : '');
    setLineDescription(line ? line.description : '');
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLine(null);
    setError(null);
    setSuccess(null);
  }, []);

  const handleSaveBusinessLine = useCallback(async () => {
    if (!lineName.trim()) {
      setError('Business line name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let updatedCompany: Company;

      if (editingLine) {
        // Update existing business line
        updatedCompany = await CompanyService.updateBusinessLine(
          currentCompany.id,
          editingLine.id,
          {
            name: lineName.trim(),
            description: lineDescription.trim(),
          }
        );
        setSuccess('Business line updated successfully!');
      } else {
        // Create new business line
        updatedCompany = await CompanyService.createBusinessLine(currentCompany.id, {
          name: lineName.trim(),
          description: lineDescription.trim(),
        });
        setSuccess('Business line created successfully!');
      }

      setCurrentCompany(updatedCompany);
      onBusinessLinesUpdate(updatedCompany);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error) {
      console.error('Error saving business line:', error);
      setError(error instanceof Error ? error.message : 'Failed to save business line');
    } finally {
      setIsLoading(false);
    }
  }, [lineName, lineDescription, editingLine, currentCompany, onBusinessLinesUpdate, handleCloseModal]);

  const handleDeleteBusinessLine = useCallback(async (lineId: string) => {
    if (!confirm('Are you sure you want to delete this business line? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCompany = await CompanyService.deleteBusinessLine(currentCompany.id, lineId);
      setCurrentCompany(updatedCompany);
      onBusinessLinesUpdate(updatedCompany);
      setSuccess('Business line deleted successfully!');
    } catch (error) {
      console.error('Error deleting business line:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete business line');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, onBusinessLinesUpdate]);

  // Mock data for demonstration - in real app, this would come from API
  const getBusinessLineStats = (line: BusinessLine) => ({
    contentIdeas: Math.floor(Math.random() * 15) + 3,
    lastActivity: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
  });

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={onBack}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} />
          Companies
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
          {currentCompany.name}
        </Typography>
      </Breadcrumbs>

      {/* Compact Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
          Business Lines
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {currentCompany.businessLines?.length || 0} {currentCompany.businessLines?.length === 1 ? 'line' : 'lines'} • {currentCompany.name}
        </Typography>
        {currentCompany.description && (
          <Chip
            label={currentCompany.description}
            variant="outlined"
            color="secondary"
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Compact Business Lines Grid */}
      <Grid container spacing={2}>
        {/* Add Business Line Card */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AddBusinessLineCard onClick={() => handleOpenModal()} />
        </Grid>

        {/* Existing Business Lines - Compact Cards */}
        {currentCompany.businessLines?.map((line) => {
          const stats = getBusinessLineStats(line);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={line.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                  },
                }}
                onClick={() => onBusinessLineSelect(line)}
              >
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Business Line Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'secondary.main',
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      {line.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.95rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {line.name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1.5,
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {line.description || 'No description provided'}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  {/* Stats */}
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.5, color: 'secondary.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {stats.contentIdeas} ideas
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        Active
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Last Activity */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 12, mr: 0.5, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled">
                      {stats.lastActivity.toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 1.5, pt: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box>
                      <Tooltip title="Edit Business Line">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(line);
                          }}
                          color="primary"
                          size="small"
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Business Line">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBusinessLine(line.id);
                          }}
                          color="error"
                          size="small"
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      endIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBusinessLineSelect(line);
                      }}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        height: 28,
                      }}
                    >
                      Generate
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add business line"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => handleOpenModal()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Business Line Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingLine ? 'Edit Business Line' : 'Add New Business Line'}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="normal"
              label="Business Line Name"
              fullWidth
              variant="outlined"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              required
              sx={{ mb: 2 }}
              placeholder="e.g., Product Marketing, Customer Support"
            />
            
            <TextField
              margin="normal"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={lineDescription}
              onChange={(e) => setLineDescription(e.target.value)}
              placeholder="Describe what this business line focuses on..."
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveBusinessLine}
            variant="contained"
            disabled={isLoading || !lineName.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : editingLine ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};