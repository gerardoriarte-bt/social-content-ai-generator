import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { Company, BusinessLine } from '../types';

interface QuickNavigationProps {
  companies: Company[];
  onCompanySelect: (company: Company) => void;
  onBusinessLineSelect: (company: Company, businessLine: BusinessLine) => void;
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({
  companies,
  onCompanySelect,
  onBusinessLineSelect,
}) => {
  // Mock data for demonstration
  const getCompanyStats = (company: Company) => ({
    businessLines: company.businessLines?.length || Math.floor(Math.random() * 5) + 1,
    contentIdeas: Math.floor(Math.random() * 20) + 5,
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  });

  const getBusinessLineStats = (line: BusinessLine) => ({
    contentIdeas: Math.floor(Math.random() * 15) + 3,
    lastActivity: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quick Access
      </Typography>
      
      <Stack spacing={2}>
        {companies.slice(0, 3).map((company) => {
          const stats = getCompanyStats(company);
          return (
            <Card key={company.id} sx={{ borderRadius: 2 }}>
              <CardActionArea onClick={() => onCompanySelect(company)}>
                <CardContent sx={{ p: 2 }}>
                  {/* Company Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 28,
                        height: 28,
                        mr: 1.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      {company.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.9rem',
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
                            height: 18, 
                            fontSize: '0.7rem',
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Stats */}
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 12, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {stats.businessLines} lines
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <AutoAwesomeIcon sx={{ fontSize: 12, mr: 0.5, color: 'info.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {stats.contentIdeas} ideas
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Business Lines Preview */}
                  {company.businessLines && company.businessLines.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Recent business lines:
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {stats.lastActivity.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        {company.businessLines.slice(0, 2).map((line) => (
                          <Chip
                            key={line.id}
                            label={line.name}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBusinessLineSelect(company, line);
                            }}
                          />
                        ))}
                        {company.businessLines.length > 2 && (
                          <Chip
                            label={`+${company.businessLines.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};
