
import React, { useState } from 'react';
import { IdeaService } from '../services/ideaService';
import { CompanyService } from '../services/companyService';
import { AIParamsForm } from './AIParamsForm';
import { ContentIdea, Company, BusinessLine, AIParams } from '../types';

interface IdeaGeneratorProps {
  company: Company;
  businessLine: BusinessLine;
  onIdeasGenerated: (ideas: ContentIdea[]) => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ company, businessLine, onIdeasGenerated }) => {
  const [numberOfIdeas, setNumberOfIdeas] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean | null>(null);
  const [aiParams, setAiParams] = useState<AIParams | null>(null);
  const [showAIParamsForm, setShowAIParamsForm] = useState(false);

  // Test Gemini connection and load AI params on component mount
  React.useEffect(() => {
    const initialize = async () => {
      try {
        // Test Gemini connection
        const connected = await IdeaService.testGeminiConnection();
        setIsGeminiConnected(connected);

        // Load AI params
        const params = await CompanyService.getAIParams(company.id, businessLine.id);
        setAiParams(params);
      } catch (error) {
        setIsGeminiConnected(false);
        console.error('Error initializing:', error);
      }
    };
    initialize();
  }, [company.id, businessLine.id]);

  const handleGenerateIdeas = async () => {
    if (!aiParams) {
      setError('AI parameters not found for this business line');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ideas = await IdeaService.generateIdeas(company.id, businessLine.id, numberOfIdeas);
      onIdeasGenerated(ideas);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIParamsSave = (savedParams: AIParams) => {
    setAiParams(savedParams);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Generar Ideas con IA
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isGeminiConnected === null ? 'bg-yellow-400' : isGeminiConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-600">
            {isGeminiConnected === null ? 'Conectando...' : isGeminiConnected ? 'Gemini AI Conectado' : 'Gemini AI Desconectado'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Ideas
          </label>
          <select
            value={numberOfIdeas}
            onChange={(e) => setNumberOfIdeas(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          >
            <option value={1}>1 idea</option>
            <option value={3}>3 ideas</option>
            <option value={5}>5 ideas</option>
            <option value={7}>7 ideas</option>
            <option value={10}>10 ideas</option>
          </select>
        </div>

        {!aiParams && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <p className="text-yellow-800 text-sm">
                No se encontraron parámetros de IA para esta línea de negocio
              </p>
              <button
                onClick={() => setShowAIParamsForm(true)}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
              >
                Configurar
              </button>
            </div>
          </div>
        )}

        {aiParams && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 text-sm font-medium">Parámetros de IA configurados</p>
                <p className="text-green-700 text-xs mt-1">
                  Tono: {aiParams.tone} | Personaje: {aiParams.characterType}
                </p>
              </div>
              <button
                onClick={() => setShowAIParamsForm(true)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Editar
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerateIdeas}
          disabled={isGenerating || !isGeminiConnected || !aiParams}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isGenerating || !isGeminiConnected || !aiParams
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generando ideas...
            </div>
          ) : (
            'Generar Ideas con IA'
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Información de la Generación</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Empresa:</strong> {company.name}</div>
          <div><strong>Línea de Negocio:</strong> {businessLine.name}</div>
          <div><strong>Industria:</strong> {company.industry}</div>
          <div><strong>Descripción:</strong> {company.description}</div>
        </div>
      </div>

      <AIParamsForm
        companyId={company.id}
        businessLineId={businessLine.id}
        isOpen={showAIParamsForm}
        onClose={() => setShowAIParamsForm(false)}
        onSave={handleAIParamsSave}
      />
    </div>
  );
};