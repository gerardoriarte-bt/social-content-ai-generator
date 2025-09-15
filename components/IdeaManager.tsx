import React, { useState, useEffect } from 'react';
import { IdeaGenerator } from './IdeaGenerator';
import { IdeaRepository } from './IdeaRepository';
import { EditIdeaModal } from './EditIdeaModal';
import { IdeaService } from '../services/ideaService';
import { ContentIdea, Company, BusinessLine } from '../types';

interface IdeaManagerProps {
  company: Company;
  businessLine: BusinessLine;
}

export const IdeaManager: React.FC<IdeaManagerProps> = ({ company, businessLine }) => {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load existing ideas on component mount
  useEffect(() => {
    loadIdeas();
  }, [company.id, businessLine.id]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const loadedIdeas = await IdeaService.getContentIdeas(company.id, businessLine.id);
      setIdeas(loadedIdeas);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleIdeasGenerated = (newIdeas: ContentIdea[]) => {
    setIdeas(prevIdeas => [...newIdeas, ...prevIdeas]);
  };

  const handleEditIdea = (idea: ContentIdea) => {
    setEditingIdea(idea);
    setShowEditModal(true);
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta idea? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await IdeaService.deleteContentIdea(company.id, businessLine.id, ideaId);
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la idea');
    }
  };

  const handleSaveEdit = () => {
    loadIdeas(); // Reload ideas to get the updated data
    setShowEditModal(false);
    setEditingIdea(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingIdea(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando ideas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <IdeaGenerator
        company={company}
        businessLine={businessLine}
        onIdeasGenerated={handleIdeasGenerated}
      />

      <IdeaRepository
        ideas={ideas}
        onEdit={handleEditIdea}
        onDelete={handleDeleteIdea}
      />

      <EditIdeaModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        idea={editingIdea}
        companyId={company.id}
        businessLineId={businessLine.id}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
