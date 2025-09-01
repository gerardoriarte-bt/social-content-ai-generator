import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { CompanyService } from './services/companyService';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { CompanyManager } from './components/CompanyManager';
import { BusinessLineManager } from './components/BusinessLineManager';
import { IdeaManager } from './components/IdeaManager';
import { User, Company, BusinessLine } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<BusinessLine | null>(null);
  const [currentView, setCurrentView] = useState<'companies' | 'business-lines' | 'ideas'>('companies');

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getProfile();
          setCurrentUser(user);
          
          // Load companies for the user
          const userCompanies = await CompanyService.getCompanies();
          setCompanies(userCompanies);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid auth data
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCompanies([]);
    setSelectedCompany(null);
    setSelectedBusinessLine(null);
    setCurrentView('companies');
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setSelectedBusinessLine(null);
    setCurrentView('business-lines');
  };

  const handleBusinessLineSelect = async (businessLine: BusinessLine) => {
    setSelectedBusinessLine(businessLine);
    setCurrentView('ideas');
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setSelectedBusinessLine(null);
    setCurrentView('companies');
  };

  const handleBackToBusinessLines = () => {
    setSelectedBusinessLine(null);
    setCurrentView('business-lines');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'companies' && (
            <CompanyManager 
              companies={companies} 
              onCompanySelect={handleCompanySelect}
              onCompaniesUpdate={setCompanies}
            />
          )}
          
          {currentView === 'business-lines' && selectedCompany && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToCompanies}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Empresas
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCompany.name} - Líneas de Negocio
                </h1>
              </div>
              
              <BusinessLineManager 
                company={selectedCompany}
                onBusinessLineSelect={handleBusinessLineSelect}
                onBusinessLinesUpdate={(updatedCompany) => setSelectedCompany(updatedCompany)}
              />
            </div>
          )}
          
          {currentView === 'ideas' && selectedCompany && selectedBusinessLine && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToBusinessLines}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Líneas de Negocio
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCompany.name} - {selectedBusinessLine.name} - Ideas
                </h1>
              </div>
              
              <IdeaManager 
                company={selectedCompany}
                businessLine={selectedBusinessLine}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;