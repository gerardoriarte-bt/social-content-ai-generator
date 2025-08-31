import React, { useState, useRef, useEffect } from 'react';
import type { View } from '../App';
import type { User } from '../types';
import { SparklesIcon } from './icons';

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, currentView, onNavigate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems: { view: View; label: string }[] = [
    { view: 'companies', label: 'Companies' },
    { view: 'repository', label: 'Idea Repository' },
    { view: 'users', label: 'Users' },
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
      <nav className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 px-6 py-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-premium-red-600" />
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate('companies'); }} 
              className="ml-2 text-lg font-bold text-slate-900 tracking-wide"
            >
                Beta Content Ai
            </a>
          </div>
          
          <div className="w-full h-px bg-slate-200 my-1"></div>

          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.view}
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate(item.view); }}
                className={`text-sm font-medium transition-colors ${
                  currentView === item.view || (currentView === 'businessLines' && item.view === 'companies') || (currentView === 'generator' && item.view === 'companies')
                    ? 'text-premium-red-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {user && (
            <div ref={dropdownRef} className="absolute top-1/2 -translate-y-1/2 right-4">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="block w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 shadow-md">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <div className="px-4 py-2 border-b border-slate-200">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                            <button
                                onClick={onSignOut}
                                className="w-full text-left block px-4 py-2 text-sm text-premium-red-600 hover:bg-slate-100"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </nav>
    </header>
  );
};