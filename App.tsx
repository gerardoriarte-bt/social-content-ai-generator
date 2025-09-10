import React, { useState, useEffect } from 'react';
import { User, Company, BusinessLine } from './types';
import { CompanyManager } from './components/CompanyManager';
import { BusinessLineManager } from './components/BusinessLineManager';
import { IdeaGenerator } from './components/IdeaGenerator';
import { Header } from './components/Header';
import { CompanyService } from './services/companyService';

type AppStep = 'companies' | 'business-lines' | 'idea-generation';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AppStep>('companies');
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
          <CompanyManager
            companies={companies}
            onCompaniesUpdate={setCompanies}
            onCompanySelect={handleCompanySelect}
          />
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
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 Social Content AI Generator
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Generate amazing content ideas step by step
            </p>
            
            {/* Step Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${currentStep === 'companies' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'companies' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Companies</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center ${currentStep === 'business-lines' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'business-lines' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Business Lines</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center ${currentStep === 'idea-generation' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'idea-generation' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Ideas</span>
                </div>
              </div>
            </div>
          </div>

          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
}
