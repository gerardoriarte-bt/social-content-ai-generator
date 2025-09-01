import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { authService, User } from './services/authService';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getProfile();
          setCurrentUser(user);
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
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {currentUser.name}! 👋
            </h2>
            <p className="text-gray-600 mb-6">
              Your Social Content AI Generator is ready to help you create amazing content.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Create your first company</li>
                <li>• Add business lines</li>
                <li>• Generate content ideas with AI</li>
                <li>• Build your content repository</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Backend API is running and ready. Frontend will be updated with full functionality soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;