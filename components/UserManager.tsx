import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, saveUsers, addUser, updateUser, deleteUser } from '../services/authService';
import type { User } from '../types';
import { Modal } from './Modal';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatarUrl, setUserAvatarUrl] = useState('');

  const fetchUsers = useCallback(() => {
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = useCallback((user: User | null = null) => {
    setEditingUser(user);
    setUserName(user ? user.name : '');
    setUserEmail(user ? user.email : '');
    setUserAvatarUrl(user ? user.avatarUrl : '');
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserAvatarUrl('');
  }, []);

  const handleSaveUser = useCallback(() => {
    if (!userName.trim() || !userEmail.trim()) {
        alert("Name and email are required.");
        return;
    }

    if (editingUser) {
      updateUser({ ...editingUser, name: userName.trim(), email: userEmail.trim(), avatarUrl: userAvatarUrl.trim() });
    } else {
      addUser({
        name: userName.trim(),
        email: userEmail.trim(),
        avatarUrl: userAvatarUrl.trim() || `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(userName.trim())}`
      });
    }
    fetchUsers();
    handleCloseModal();
  }, [userName, userEmail, userAvatarUrl, editingUser, fetchUsers, handleCloseModal]);

  const handleDeleteUser = useCallback((userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      deleteUser(userId);
      fetchUsers();
    }
  }, [fetchUsers]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700"
        >
          <PlusIcon className="w-5 h-5" />
          Add User
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <ul role="list" className="divide-y divide-slate-200">
          {users.map((user) => (
            <li key={user.id} className="flex justify-between items-center gap-x-6 p-4 sm:p-6 hover:bg-slate-50/50">
                <div className="flex min-w-0 gap-x-4">
                    <img className="h-12 w-12 flex-none rounded-full bg-slate-50" src={user.avatarUrl} alt="" />
                    <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-slate-900">{user.name}</p>
                        <p className="mt-1 truncate text-xs leading-5 text-slate-500">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-x-2">
                    <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-500 hover:text-premium-yellow-500"><PencilIcon /></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-500 hover:text-premium-red-600"><TrashIcon /></button>
                </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add New User'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg" placeholder="e.g., John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg" placeholder="e.g., john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Avatar URL (Optional)</label>
            <input type="text" value={userAvatarUrl} onChange={(e) => setUserAvatarUrl(e.target.value)} className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg" placeholder="Leave blank for auto-generation" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300/80">Cancel</button>
            <button onClick={handleSaveUser} className="px-4 py-2 bg-premium-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-premium-red-700">Save User</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};