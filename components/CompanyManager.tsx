import React, { useState, useEffect, useCallback } from 'react';
import { getCompanies, saveCompanies } from '../services/dataService';
import type { Company, User } from '../types';
import { Modal } from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon } from './icons';

interface CompanyManagerProps {
  onSelectCompany: (company: Company) => void;
  user: User;
}

const AddCompanyCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
      onClick={onClick}
      className="relative block w-full h-full border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-premium-red-500 hover:text-premium-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-500 transition-colors duration-200"
    >
      <PlusIcon className="mx-auto h-8 w-8" />
      <span className="mt-2 block text-sm font-semibold">Add New Company</span>
    </button>
);

export const CompanyManager: React.FC<CompanyManagerProps> = ({ onSelectCompany, user }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    setCompanies(getCompanies(user.id));
  }, [user]);

  const handleOpenModal = useCallback((company: Company | null = null) => {
    setEditingCompany(company);
    setCompanyName(company ? company.name : '');
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setCompanyName('');
  }, []);

  const handleSaveCompany = useCallback(() => {
    if (!companyName.trim()) return;

    let updatedCompanies;
    if (editingCompany) {
      updatedCompanies = companies.map(c => 
        c.id === editingCompany.id ? { ...c, name: companyName.trim() } : c
      );
    } else {
      const newCompany: Company = {
        id: Date.now().toString(),
        name: companyName.trim(),
        businessLines: [],
      };
      updatedCompanies = [...companies, newCompany];
    }
    setCompanies(updatedCompanies);
    saveCompanies(user.id, updatedCompanies);
    handleCloseModal();
  }, [companyName, editingCompany, companies, handleCloseModal, user.id]);

  const handleDeleteCompany = useCallback((e: React.MouseEvent, companyId: string) => {
    e.stopPropagation(); // Prevent card click event
    if (window.confirm('Are you sure you want to delete this company and all its data?')) {
      const updatedCompanies = companies.filter(c => c.id !== companyId);
      setCompanies(updatedCompanies);
      saveCompanies(user.id, updatedCompanies);
    }
  }, [companies, user.id]);
  
  const handleEditCompany = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation(); // Prevent card click event
    handleOpenModal(company);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
      </div>
      
      {companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div 
              key={company.id} 
              onClick={() => onSelectCompany(company)}
              className="group relative bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-premium-red-600 transition-colors">{company.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{company.businessLines.length} Business Lines</p>
              </div>
              <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEditCompany(e, company)} className="p-2 text-slate-500 hover:text-premium-yellow-500 bg-white/50 backdrop-blur-sm rounded-full"><PencilIcon /></button>
                  <button onClick={(e) => handleDeleteCompany(e, company.id)} className="p-2 text-slate-500 hover:text-premium-red-600 bg-white/50 backdrop-blur-sm rounded-full"><TrashIcon /></button>
              </div>
              <div className="mt-4 flex justify-end items-center text-premium-red-600">
                <span className="text-sm font-semibold">Manage</span>
                <ChevronRightIcon className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
          <AddCompanyCard onClick={() => handleOpenModal()} />
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
            <h3 className="text-lg font-medium text-slate-800">No companies yet</h3>
            <p className="mt-1 text-sm text-slate-600">Get started by adding your first company.</p>
            <button
                onClick={() => handleOpenModal()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
            >
                <PlusIcon className="w-5 h-5" />
                Add Company
            </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCompany ? 'Edit Company' : 'Add New Company'}>
        <div className="space-y-4">
          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-slate-700">Company Name</label>
            <input
              type="text"
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-premium-red-500 sm:text-sm"
              placeholder="e.g., Apple Inc."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300/80"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCompany}
              className="px-4 py-2 bg-premium-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-premium-red-700"
            >
              Save Company
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};