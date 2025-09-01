import React, { useState } from 'react';
import { ContentIdea } from '../types';

interface IdeaCardProps {
  idea: ContentIdea;
  onEdit?: (idea: ContentIdea) => void;
  onDelete?: (ideaId: string) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onEdit, onDelete }) => {
  const [showRationale, setShowRationale] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex-1 pr-4">
          {idea.title}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRationale(!showRationale)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Ver justificación"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(idea)}
              className="p-2 text-gray-500 hover:text-green-600 transition-colors"
              title="Editar idea"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(idea.id)}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Eliminar idea"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{idea.description}</p>

      {showRationale && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Justificación de la IA:</h4>
          <p className="text-sm text-blue-700">{idea.rationale}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            {idea.platform}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(idea.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {idea.hashtags && idea.hashtags.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {idea.hashtags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface IdeaRepositoryProps {
  ideas: ContentIdea[];
  onEdit?: (idea: ContentIdea) => void;
  onDelete?: (ideaId: string) => void;
}

export const IdeaRepository: React.FC<IdeaRepositoryProps> = ({ ideas, onEdit, onDelete }) => {
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIdeas = ideas.filter(idea => {
    const matchesPlatform = filterPlatform === 'all' || idea.platform === filterPlatform;
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const platforms = Array.from(new Set(ideas.map(idea => idea.platform)));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Repositorio de Ideas ({ideas.length})
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las plataformas</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {ideas.length === 0 ? 'No hay ideas generadas' : 'No se encontraron ideas'}
            </h3>
            <p className="text-gray-500">
              {ideas.length === 0 
                ? 'Genera tu primera idea con IA para comenzar' 
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIdeas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};