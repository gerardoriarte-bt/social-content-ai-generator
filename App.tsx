import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { User, Company, BusinessLine } from './types';
import { CompanyManager } from './components/CompanyManager';
import { BusinessLineManager } from './components/BusinessLineManager';
import { IdeaGenerator } from './components/IdeaGenerator';
import { Header } from './components/Header';
import { ApiDebugger } from './components/ApiDebugger';
import { GeminiStatusBanner } from './components/GeminiStatusBanner';
import { QuickNavigation } from './components/QuickNavigation';
import { CompanyService } from './services/companyService';
import { theme, darkTheme } from './src/theme';
import './src/fonts.css';

type AppStep = 'companies' | 'business-lines' | 'idea-generation';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AppStep>('companies');
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser] = useState<User>({
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<BusinessLine | null>(null);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentStep('business-lines');
  };

  const handleBusinessLineSelect = (businessLine: BusinessLine) => {
    setSelectedBusinessLine(businessLine);
    setCurrentStep('idea-generation');
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setSelectedBusinessLine(null);
    setCurrentStep('companies');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBackToBusinessLines = () => {
    setSelectedBusinessLine(null);
    setCurrentStep('business-lines');
  };

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const userCompanies = await CompanyService.getCompanies();
        setCompanies(userCompanies);
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'companies':
        return (
          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Quick Navigation Sidebar */}
            {companies.length > 0 && (
              <Box sx={{ width: 300, flexShrink: 0 }}>
                <QuickNavigation
                  companies={companies}
                  onCompanySelect={handleCompanySelect}
                  onBusinessLineSelect={(company, businessLine) => {
                    setSelectedCompany(company);
                    setSelectedBusinessLine(businessLine);
                    setCurrentStep('idea-generation');
                  }}
                />
              </Box>
            )}
            
            {/* Main Content */}
            <Box sx={{ flexGrow: 1 }}>
              <CompanyManager
                companies={companies}
                onCompaniesUpdate={setCompanies}
                onCompanySelect={handleCompanySelect}
              />
            </Box>
          </Box>
        );
      
      case 'business-lines':
        return selectedCompany ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Business Lines - {selectedCompany.name}
                </h2>
                <p className="text-gray-600">Manage business lines for content generation</p>
              </div>
              <button
                onClick={handleBackToCompanies}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Companies
              </button>
            </div>
            <BusinessLineManager
              company={selectedCompany}
              onBusinessLineSelect={handleBusinessLineSelect}
              onBusinessLinesUpdate={(updatedCompany) => {
                setSelectedCompany(updatedCompany);
                setCompanies(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c));
              }}
            />
          </div>
        ) : null;
      
      case 'idea-generation':
        return selectedBusinessLine ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Idea Generation - {selectedBusinessLine.name}
                </h2>
                <p className="text-gray-600">Generate content ideas for this business line</p>
              </div>
              <button
                onClick={handleBackToBusinessLines}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Business Lines
              </button>
            </div>
            <IdeaGenerator
              businessLine={selectedBusinessLine}
              company={selectedCompany!}
            />
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header 
          currentUser={currentUser} 
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={() => {}} // Mock logout function
        />
        
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Gemini Status Banner */}
          <Box sx={{ mb: 4 }}>
            <GeminiStatusBanner />
          </Box>
          
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(45deg, #7c3aed, #06b6d4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🚀 Social Content AI Generator
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Generate amazing content ideas step by step
            </Typography>
            
            {/* Step Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: currentStep === 'companies' ? 'primary.main' : 'grey.300',
                    color: currentStep === 'companies' ? 'white' : 'grey.600',
                    fontWeight: 600,
                  }}
                >
                  1
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500,
                    color: currentStep === 'companies' ? 'primary.main' : 'text.secondary'
                  }}
                >
                  Companies
                </Typography>
              </Box>
              
              <Box sx={{ width: 32, height: 2, bgcolor: 'grey.300' }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: currentStep === 'business-lines' ? 'primary.main' : 'grey.300',
                    color: currentStep === 'business-lines' ? 'white' : 'grey.600',
                    fontWeight: 600,
                  }}
                >
                  2
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500,
                    color: currentStep === 'business-lines' ? 'primary.main' : 'text.secondary'
                  }}
                >
                  Business Lines
                </Typography>
              </Box>
              
              <Box sx={{ width: 32, height: 2, bgcolor: 'grey.300' }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: currentStep === 'idea-generation' ? 'primary.main' : 'grey.300',
                    color: currentStep === 'idea-generation' ? 'white' : 'grey.600',
                    fontWeight: 600,
                  }}
                >
                  3
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500,
                    color: currentStep === 'idea-generation' ? 'primary.main' : 'text.secondary'
                  }}
                >
                  Ideas
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Render current step */}
          {renderCurrentStep()}
        </Container>

        {/* API Debugger - Remove in production */}
        <ApiDebugger />
      </Box>
    </ThemeProvider>
  );
}
