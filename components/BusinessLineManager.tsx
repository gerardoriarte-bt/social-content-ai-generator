import React, { useState, useCallback } from 'react';
import { CompanyService } from '../services/companyService';
import type { Company, BusinessLine } from '../types';
import { Modal } from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from './icons';

interface BusinessLineManagerProps {
  company: Company;
  onBusinessLineSelect: (businessLine: BusinessLine) => void;
  onBusinessLinesUpdate: (updatedCompany: Company) => void;
}

export const BusinessLineManager: React.FC<BusinessLineManagerProps> = ({ company, onBusinessLineSelect, onBusinessLinesUpdate }) => {
  const [currentCompany, setCurrentCompany] = useState<Company>(company);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BusinessLine | null>(null);
  const [lineName, setLineName] = useState('');
  const [lineDescription, setLineDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = useCallback((line: BusinessLine | null = null) => {
    setEditingLine(line);
    setLineName(line ? line.name : '');
    setLineDescription(line ? line.description : '');
    setIsModalOpen(true);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLine(null);
    setLineName('');
    setLineDescription('');
  }, []);

  const handleSaveLine = useCallback(async () => {
    if (!lineName.trim() || !lineDescription.trim()) return;

    setIsLoading(true);
    try {
      if (editingLine) {
        const updatedBusinessLine = await CompanyService.updateBusinessLine(
          currentCompany.id,
          editingLine.id,
          {
            name: lineName.trim(),
            description: lineDescription.trim(),
          }
        );
        const updatedLines = currentCompany.businessLines.map(l => 
          l.id === editingLine.id ? updatedBusinessLine : l
        );
        const updatedCompany = { ...currentCompany, businessLines: updatedLines };
        setCurrentCompany(updatedCompany);
        onBusinessLinesUpdate(updatedCompany);
      } else {
        const newBusinessLine = await CompanyService.createBusinessLine(
          currentCompany.id,
          {
            name: lineName.trim(),
            description: lineDescription.trim(),
          }
        );
        const updatedCompany = { 
          ...currentCompany, 
          businessLines: [...currentCompany.businessLines, newBusinessLine] 
        };
        setCurrentCompany(updatedCompany);
        onBusinessLinesUpdate(updatedCompany);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving business line:', error);
      alert('Error saving business line. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [lineName, lineDescription, editingLine, currentCompany, onBusinessLinesUpdate, handleCloseModal]);
  
  const handleDeleteLine = useCallback(async (lineId: string) => {
    if (window.confirm('Are you sure you want to delete this business line?')) {
      try {
        await CompanyService.deleteBusinessLine(currentCompany.id, lineId);
        const updatedLines = currentCompany.businessLines.filter(l => l.id !== lineId);
        const updatedCompany = { ...currentCompany, businessLines: updatedLines };
        setCurrentCompany(updatedCompany);
        onBusinessLinesUpdate(updatedCompany);
      } catch (error) {
        console.error('Error deleting business line:', error);
        alert('Error deleting business line. Please try again.');
      }
    }
  }, [currentCompany, onBusinessLinesUpdate]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{currentCompany.name}</h1>
          <p className="text-lg text-slate-600">Business Lines</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Business Line
        </button>
      </div>
      
      {currentCompany.businessLines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentCompany.businessLines.map((line) => (
            <div 
              key={line.id} 
              onClick={() => onBusinessLineSelect(line)}
              className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-slate-900 flex-1 pr-2">{line.name}</h2>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(line);
                      }} 
                      className="p-2 text-slate-500 hover:text-premium-yellow-500 rounded-full"
                    >
                      <PencilIcon />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLine(line.id);
                      }} 
                      className="p-2 text-slate-500 hover:text-premium-red-600 rounded-full"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600 p-4 bg-slate-100 rounded-lg line-clamp-3">{line.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">Click to view ideas</span>
                <SparklesIcon className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h3 className="text-lg font-medium text-slate-800 mb-4">No business lines yet</h3>
              <p className="text-sm text-slate-600 mb-6">Create your first business line to start generating content ideas.</p>
              <button
                onClick={() => handleOpenModal()}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Business Line
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {editingLine ? 'Edit Business Line' : 'Create New Business Line'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Line Name</label>
              <input
                type="text"
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
                placeholder="Enter business line name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={lineDescription}
                onChange={(e) => setLineDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
                placeholder="Enter business line description"
                rows={3}
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
              onClick={handleSaveLine}
              disabled={isLoading || !lineName.trim() || !lineDescription.trim()}
              className="px-4 py-2 bg-premium-red-600 text-white rounded-md hover:bg-premium-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : editingLine ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};