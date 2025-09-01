import React, { useState, useEffect, useCallback } from 'react';
import { CompanyService } from '../services/companyService';
import type { Company } from '../types';
import { Modal } from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon } from './icons';

interface CompanyManagerProps {
  companies: Company[];
  onCompanySelect: (company: Company) => void;
  onCompaniesUpdate: (companies: Company[]) => void;
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

export const CompanyManager: React.FC<CompanyManagerProps> = ({ companies, onCompanySelect, onCompaniesUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingCompany) {
      setCompanyName(editingCompany.name);
      setCompanyDescription(editingCompany.description);
      setCompanyIndustry(editingCompany.industry);
    } else {
      setCompanyName('');
      setCompanyDescription('');
      setCompanyIndustry('');
    }
  }, [editingCompany]);

  const handleOpenModal = useCallback((company: Company | null = null) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setCompanyName('');
    setCompanyDescription('');
    setCompanyIndustry('');
  }, []);

  const handleSaveCompany = useCallback(async () => {
    if (!companyName.trim() || !companyDescription.trim() || !companyIndustry.trim()) return;

    setIsLoading(true);
    try {
      if (editingCompany) {
        const updatedCompany = await CompanyService.updateCompany(editingCompany.id, {
          name: companyName.trim(),
          description: companyDescription.trim(),
          industry: companyIndustry.trim(),
        });
        const updatedCompanies = companies.map(c => 
          c.id === editingCompany.id ? updatedCompany : c
        );
        onCompaniesUpdate(updatedCompanies);
      } else {
        const newCompany = await CompanyService.createCompany({
          name: companyName.trim(),
          description: companyDescription.trim(),
          industry: companyIndustry.trim(),
        });
        onCompaniesUpdate([...companies, newCompany]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Error saving company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [companyName, companyDescription, companyIndustry, editingCompany, companies, onCompaniesUpdate, handleCloseModal]);

  const handleDeleteCompany = useCallback(async (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this company and all its data?')) {
      try {
        await CompanyService.deleteCompany(companyId);
        const updatedCompanies = companies.filter(c => c.id !== companyId);
        onCompaniesUpdate(updatedCompanies);
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Error deleting company. Please try again.');
      }
    }
  }, [companies, onCompaniesUpdate]);
  
  const handleEditCompany = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    handleOpenModal(company);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Company
        </button>
      </div>
      
      {companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div 
              key={company.id} 
              onClick={() => onCompanySelect(company)}
              className="group relative bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-premium-red-600 transition-colors">{company.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{company.description}</p>
                <p className="text-xs text-slate-500 mt-2">Industry: {company.industry}</p>
              </div>
              <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleEditCompany(e, company)} className="p-2 text-slate-500 hover:text-premium-yellow-500 bg-white/50 backdrop-blur-sm rounded-full">
                  <PencilIcon />
                </button>
                <button onClick={(e) => handleDeleteCompany(e, company.id)} className="p-2 text-slate-500 hover:text-premium-red-600 bg-white/50 backdrop-blur-sm rounded-full">
                  <TrashIcon />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-500">Click to view business lines</span>
                <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-premium-red-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h3 className="text-lg font-medium text-slate-800 mb-4">No companies yet</h3>
              <p className="text-sm text-slate-600 mb-6">Create your first company to get started with content generation.</p>
              <button
                onClick={() => handleOpenModal()}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Company
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {editingCompany ? 'Edit Company' : 'Create New Company'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
                placeholder="Enter company description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={companyIndustry}
                onChange={(e) => setCompanyIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
                placeholder="Enter industry"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCompany}
              disabled={isLoading || !companyName.trim() || !companyDescription.trim() || !companyIndustry.trim()}
              className="px-4 py-2 bg-premium-red-600 text-white rounded-md hover:bg-premium-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : editingCompany ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};