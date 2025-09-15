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
  console.log('BusinessLineManager: Rendering for company:', company.name);
  const [currentCompany, setCurrentCompany] = useState<Company>(company);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BusinessLine | null>(null);
  const [lineName, setLineName] = useState('');
  const [lineDescription, setLineDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setError(null);
    setSuccess(null);
  }, []);

  const handleSaveLine = useCallback(async () => {
    if (!lineName.trim() || !lineDescription.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
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
        setSuccess('Business line updated successfully!');
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
        setSuccess('Business line created successfully!');
      }
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving business line:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error saving business line. Please try again.';
      setError(errorMessage);
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
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
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
              className="px-4 py-2 bg-premium-red-600 text-white rounded-md hover:bg-premium-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Saving...' : editingLine ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

console.log('BusinessLineManager: Component definition complete');