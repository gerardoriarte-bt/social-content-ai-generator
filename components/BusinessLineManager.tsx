import React, { useState, useCallback } from 'react';
import { getCompanies, saveCompanies } from '../services/dataService';
import type { Company, BusinessLine, User } from '../types';
import { Modal } from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from './icons';

interface BusinessLineManagerProps {
  company: Company;
  onStartGeneration: (company: Company, businessLine: BusinessLine) => void;
  user: User;
}

const AddBusinessLineCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
      onClick={onClick}
      className="relative block w-full h-full min-h-[180px] border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-premium-red-500 hover:text-premium-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-500 transition-colors duration-200 flex flex-col items-center justify-center"
    >
      <PlusIcon className="mx-auto h-8 w-8" />
      <span className="mt-2 block text-sm font-semibold">Add Business Line</span>
    </button>
);


export const BusinessLineManager: React.FC<BusinessLineManagerProps> = ({ company, onStartGeneration, user }) => {
  const [currentCompany, setCurrentCompany] = useState<Company>(company);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BusinessLine | null>(null);
  const [lineName, setLineName] = useState('');
  const [lineContext, setLineContext] = useState('');

  const updateCompany = (updatedCompany: Company) => {
    const allCompanies = getCompanies(user.id);
    const updatedCompanies = allCompanies.map(c => c.id === updatedCompany.id ? updatedCompany : c);
    saveCompanies(user.id, updatedCompanies);
    setCurrentCompany(updatedCompany);
  };

  const handleOpenModal = useCallback((line: BusinessLine | null = null) => {
    setEditingLine(line);
    setLineName(line ? line.name : '');
    setLineContext(line ? line.context : '');
    setIsModalOpen(true);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLine(null);
    setLineName('');
    setLineContext('');
  }, []);

  const handleSaveLine = useCallback(() => {
    if (!lineName.trim() || !lineContext.trim()) return;

    let updatedLines;
    if (editingLine) {
      updatedLines = currentCompany.businessLines.map(l => 
        l.id === editingLine.id ? { ...l, name: lineName.trim(), context: lineContext.trim() } : l
      );
    } else {
      const newLine: BusinessLine = {
        id: Date.now().toString(),
        name: lineName.trim(),
        context: lineContext.trim(),
      };
      updatedLines = [...currentCompany.businessLines, newLine];
    }
    updateCompany({ ...currentCompany, businessLines: updatedLines });
    handleCloseModal();
  }, [lineName, lineContext, editingLine, currentCompany, handleCloseModal]);
  
  const handleDeleteLine = useCallback((lineId: string) => {
    if (window.confirm('Are you sure you want to delete this business line?')) {
      const updatedLines = currentCompany.businessLines.filter(l => l.id !== lineId);
      updateCompany({ ...currentCompany, businessLines: updatedLines });
    }
  }, [currentCompany]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{currentCompany.name}</h1>
          <p className="text-lg text-slate-600">Business Lines</p>
        </div>
      </div>
      
      {currentCompany.businessLines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentCompany.businessLines.map((line) => (
              <div key={line.id} className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-slate-900 flex-1 pr-2">{line.name}</h2>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button onClick={() => handleOpenModal(line)} className="p-2 text-slate-500 hover:text-premium-yellow-500 rounded-full"><PencilIcon /></button>
                      <button onClick={() => handleDeleteLine(line.id)} className="p-2 text-slate-500 hover:text-premium-red-600 rounded-full"><TrashIcon /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 p-4 bg-slate-100 rounded-lg line-clamp-3">{line.context}</p>
                </div>
                <div className="mt-4 text-right">
                    <button 
                      onClick={() => onStartGeneration(currentCompany, line)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      Generate Ideas
                    </button>
                </div>
              </div>
            ))}
            <AddBusinessLineCard onClick={() => handleOpenModal()} />
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
            <h3 className="text-lg font-medium text-slate-800">No business lines found</h3>
            <p className="mt-1 text-sm text-slate-600">Add a business line to start generating content ideas.</p>
            <button
                onClick={() => handleOpenModal()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
            >
                <PlusIcon className="w-5 h-5" />
                Add Business Line
            </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLine ? 'Edit Business Line' : 'Add Business Line'}>
        <div className="space-y-4">
          <div>
            <label htmlFor="line-name" className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              id="line-name"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-premium-red-500 sm:text-sm"
              placeholder="e.g., iPhone Division"
            />
          </div>
          <div>
            <label htmlFor="line-context" className="block text-sm font-medium text-slate-700">Context for AI</label>
            <textarea
              id="line-context"
              rows={4}
              value={lineContext}
              onChange={(e) => setLineContext(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-premium-red-500 sm:text-sm"
              placeholder="Describe the product, service, target audience, and key messaging."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300/80">Cancel</button>
            <button onClick={handleSaveLine} className="px-4 py-2 bg-premium-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-premium-red-700">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};