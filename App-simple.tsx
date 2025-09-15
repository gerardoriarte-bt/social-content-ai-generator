import React, { useState } from 'react';
import { User, Company } from './types';
import { CompanyManager } from './components/CompanyManager';
import { Header } from './components/Header';

export default function App() {
  const [loading, setLoading] = useState(false);
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
              ¡Aplicación funcionando correctamente!
            </p>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
              <strong>✅ Estado:</strong> Aplicación cargada exitosamente
            </div>
          </div>

          <CompanyManager
            companies={companies}
            selectedCompany={selectedCompany}
            onCompaniesChange={setCompanies}
            onCompanySelect={setSelectedCompany}
          />
        </div>
      </main>
    </div>
  );
}
