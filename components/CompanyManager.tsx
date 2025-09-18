import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { CompanyService } from '../services/companyService';
import type { Company, BusinessLine } from '../types';
import { BusinessLineManager } from './BusinessLineManager';

interface CompanyManagerProps {
  companies: Company[];
  selectedCompany: Company | null;
  onCompanySelect: (company: Company) => void;
  onCompaniesUpdate: (companies: Company[]) => void;
}

const AddCompanyCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
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
      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
      '&:hover': {
        borderColor: 'primary.main',
        backgroundColor: 'primary.50',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(124, 58, 237, 0.15)',
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
          bgcolor: 'primary.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <AddIcon sx={{ fontSize: 28, color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
        Add Company
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Start your content journey
      </Typography>
    </CardContent>
  </Card>
);

export const CompanyManager: React.FC<CompanyManagerProps> = ({ 
  companies, 
  selectedCompany, 
  onCompanySelect, 
  onCompaniesUpdate 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editingCompany) {
      setCompanyName(editingCompany.name);
      setCompanyDescription(editingCompany.description);
      setCompanyIndustry(editingCompany.industry);
    } else {
      setCompanyName('');
      setCompanyDescription('');
      setCompanyIndustry('');
    }
  }, [editingCompany]);

  const handleOpenModal = useCallback((company: Company | null = null) => {
    setEditingCompany(company);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setError(null);
    setSuccess(null);
  }, []);

  const handleSaveCompany = useCallback(async () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let updatedCompanies: Company[];

      if (editingCompany) {
        // Update existing company
        const updatedCompany = await CompanyService.updateCompany(editingCompany.id, {
          name: companyName.trim(),
          description: companyDescription.trim(),
          industry: companyIndustry.trim(),
        });
        updatedCompanies = companies.map(c => 
          c.id === editingCompany.id ? updatedCompany : c
        );
        setSuccess('Company updated successfully!');
      } else {
        // Create new company
        const newCompany = await CompanyService.createCompany({
          name: companyName.trim(),
          description: companyDescription.trim(),
          industry: companyIndustry.trim(),
        });
        updatedCompanies = [...companies, newCompany];
        setSuccess('Company created successfully!');
      }

      onCompaniesUpdate(updatedCompanies);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error) {
      console.error('Error saving company:', error);
      setError(error instanceof Error ? error.message : 'Failed to save company');
    } finally {
      setIsLoading(false);
    }
  }, [companyName, companyDescription, companyIndustry, editingCompany, companies, onCompaniesUpdate, handleCloseModal]);

  const handleDeleteCompany = useCallback(async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await CompanyService.deleteCompany(companyId);
      const updatedCompanies = companies.filter(c => c.id !== companyId);
      onCompaniesUpdate(updatedCompanies);
      setSuccess('Company deleted successfully!');
    } catch (error) {
      console.error('Error deleting company:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete company');
    } finally {
      setIsLoading(false);
    }
  }, [companies, onCompaniesUpdate]);

  // Mock data for demonstration - in real app, this would come from API
  const getCompanyStats = (company: Company) => ({
    businessLines: Math.floor(Math.random() * 5) + 1,
    contentIdeas: Math.floor(Math.random() * 20) + 5,
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  });

  if (selectedCompany) {
    return (
      <BusinessLineManager
        company={selectedCompany}
        onBack={() => onCompanySelect(null)}
      />
    );
  }

  return (
    <Box>
      {/* Compact Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
          Companies
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {companies.length} {companies.length === 1 ? 'company' : 'companies'} • Manage your content strategy
        </Typography>
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

      {/* Compact Companies Grid */}
      <Grid container spacing={2}>
        {/* Add Company Card */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AddCompanyCard onClick={() => handleOpenModal()} />
        </Grid>

        {/* Existing Companies - Compact Cards */}
        {companies.map((company) => {
          const stats = getCompanyStats(company);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
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
                onClick={() => onCompanySelect(company)}
              >
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Company Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      {company.name.charAt(0).toUpperCase()}
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
                        {company.name}
                      </Typography>
                      {company.industry && (
                        <Chip
                          label={company.industry}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem',
                            mt: 0.5,
                          }}
                        />
                      )}
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
                    {company.description || 'No description provided'}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  {/* Stats */}
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {stats.businessLines} lines
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <PeopleIcon sx={{ fontSize: 14, mr: 0.5, color: 'info.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {stats.contentIdeas} ideas
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
                      <Tooltip title="Edit Company">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(company);
                          }}
                          color="primary"
                          size="small"
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Company">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company.id);
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
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompanySelect(company);
                      }}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        height: 28,
                      }}
                    >
                      Open
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
        aria-label="add company"
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

      {/* Add/Edit Company Dialog */}
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
            {editingCompany ? 'Edit Company' : 'Add New Company'}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="normal"
              label="Company Name"
              fullWidth
              variant="outlined"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              label="Industry"
              fullWidth
              variant="outlined"
              value={companyIndustry}
              onChange={(e) => setCompanyIndustry(e.target.value)}
              placeholder="e.g., Technology, Healthcare, Finance"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCompany}
            variant="contained"
            disabled={isLoading || !companyName.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : editingCompany ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};