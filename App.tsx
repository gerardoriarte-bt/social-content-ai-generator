import React, { useState, useCallback } from 'react';
import { CompanyManager } from './components/CompanyManager';
import { BusinessLineManager } from './components/BusinessLineManager';
import { IdeaGenerator } from './components/IdeaGenerator';
import { IdeaRepository } from './components/IdeaRepository';
import { Header } from './components/Header';
import { Breadcrumb, BreadcrumbItem } from './components/Breadcrumb';
import { getCompanies } from './services/dataService';
import { Login } from './components/Login';
import { UserManager } from './components/UserManager';
import { getCurrentUser, signOut } from './services/authService';
import type { Company, BusinessLine, IdeaGroup, User } from './types';

export type View = 'companies' | 'businessLines' | 'generator' | 'repository' | 'users';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [view, setView] = useState<View>('companies');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<BusinessLine | null>(null);
  const [existingIdeaGroup, setExistingIdeaGroup] = useState<IdeaGroup | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setView('companies'); // Start at the main view after login
  };

  const handleSignOut = () => {
    signOut();
    setCurrentUser(null);
    // Reset state
    setView('companies');
    setSelectedCompany(null);
    setSelectedBusinessLine(null);
    setExistingIdeaGroup(null);
  };

  const handleNavigate = useCallback((newView: View) => {
    if (newView === 'companies') {
      setSelectedCompany(null);
      setSelectedBusinessLine(null);
    }
    // Only clear existing idea group if not navigating to repository or users
    if (newView !== 'repository' && newView !== 'users') {
        setExistingIdeaGroup(null);
    }
    setView(newView);
  }, []);

  const handleSelectCompany = useCallback((company: Company) => {
    setSelectedCompany(company);
    setSelectedBusinessLine(null);
    setExistingIdeaGroup(null);
    setView('businessLines');
  }, []);

  const handleStartGeneration = useCallback((company: Company, businessLine: BusinessLine) => {
    setSelectedCompany(company);
    setSelectedBusinessLine(businessLine);
    setExistingIdeaGroup(null); // Ensure we are in creation mode
    setView('generator');
  }, []);

  const handleGenerateMore = useCallback((group: IdeaGroup) => {
    if (!currentUser) return;
    const allCompanies = getCompanies(currentUser.id);
    const company = allCompanies.find(c => c.id === group.companyId);
    const businessLine = company?.businessLines.find(bl => bl.id === group.businessLineId);

    if (company && businessLine) {
        setSelectedCompany(company);
        setSelectedBusinessLine(businessLine);
        setExistingIdeaGroup(group);
        setView('generator');
    } else {
        alert('Could not find the original Company or Business Line for this idea group. It may have been deleted.');
    }
  }, [currentUser]);

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    if (view === 'repository' || view === 'companies' || view === 'users') {
        return [];
    }

    const items: BreadcrumbItem[] = [
        { label: 'Companies', onClick: () => handleNavigate('companies') }
    ];

    if (selectedCompany) {
        items.push({ 
            label: selectedCompany.name, 
            onClick: view === 'generator' ? () => handleSelectCompany(selectedCompany) : undefined 
        });
    }

    if (selectedBusinessLine && view === 'generator') {
        items.push({ label: selectedBusinessLine.name });
    }
    
    return items;
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'companies':
        return <CompanyManager onSelectCompany={handleSelectCompany} user={currentUser} />;
      case 'businessLines':
        if (selectedCompany) {
          return <BusinessLineManager company={selectedCompany} onStartGeneration={handleStartGeneration} user={currentUser} />;
        }
        setView('companies');
        return null;
      case 'generator':
        if (selectedCompany && selectedBusinessLine) {
          return <IdeaGenerator company={selectedCompany} businessLine={selectedBusinessLine} existingGroup={existingIdeaGroup} user={currentUser} />;
        }
        setView('companies');
        return null;
      case 'repository':
        return <IdeaRepository onGenerateMore={handleGenerateMore} user={currentUser} />;
      case 'users':
        return <UserManager />;
      default:
        return <CompanyManager onSelectCompany={handleSelectCompany} user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header user={currentUser} onSignOut={handleSignOut} currentView={view} onNavigate={handleNavigate} />
      <main className="max-w-7xl mx-auto pt-40 pb-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={buildBreadcrumbs()} />
        {renderContent()}
      </main>
    </div>
  );
};

export default App;