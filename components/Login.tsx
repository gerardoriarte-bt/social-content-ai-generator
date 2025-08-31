import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { Modal } from './Modal';
import { getUsers, addUser, signIn } from '../services/authService';
import { SparklesIcon, GoogleIcon, PlusIcon, UserCircleIcon } from './icons';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const fetchUsers = useCallback(() => {
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchUsers();
    }
  }, [isModalOpen, fetchUsers]);

  const handleSelectUser = (user: User) => {
    signIn(user.id);
    onLoginSuccess(user);
    setIsModalOpen(false);
  };
  
  const handleOpenCreateUser = () => {
    setIsModalOpen(false);
    setIsCreateUserModalOpen(true);
  };

  const handleCreateAndSignIn = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
        alert("Name and email are required.");
        return;
    }
    const newUser = addUser({ 
      name: newUserName, 
      email: newUserEmail, 
      avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(newUserName)}` 
    });
    signIn(newUser.id);
    onLoginSuccess(newUser);
    setIsCreateUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="flex items-center justify-center mb-6">
            <SparklesIcon className="h-10 w-10 text-premium-red-600" />
            <h1 className="ml-3 text-4xl font-bold text-slate-900 tracking-tight">
                Beta Content Ai
            </h1>
        </div>
        <p className="text-slate-600 mb-8">Your strategic partner for social media content generation.</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-700 text-base font-semibold rounded-lg shadow-md border border-slate-200 hover:bg-slate-100/80 transition-colors"
        >
          <GoogleIcon className="w-6 h-6" />
          Sign in with Google
        </button>
      </div>

      {/* User Selection Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Choose an account">
        <div className="space-y-2">
            {users.map(user => (
                <button key={user.id} onClick={() => handleSelectUser(user)} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 text-left">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                </button>
            ))}
            <button onClick={handleOpenCreateUser} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 text-left">
                <div className="w-10 h-10 flex items-center justify-center">
                    <UserCircleIcon className="w-7 h-7 text-slate-600" />
                </div>
                <div>
                    <p className="font-semibold text-slate-800">Use another account</p>
                </div>
            </button>
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} title="Create a New User">
        <div className="space-y-4">
            <div>
                <label htmlFor="new-user-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                <input type="text" id="new-user-name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg" placeholder="e.g., Jane Doe" />
            </div>
            <div>
                <label htmlFor="new-user-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                <input type="email" id="new-user-email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg" placeholder="e.g., jane@example.com" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsCreateUserModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300/80">Cancel</button>
                <button onClick={handleCreateAndSignIn} className="px-4 py-2 bg-premium-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-premium-red-700">Create & Sign In</button>
            </div>
        </div>
      </Modal>
    </div>
  );
};