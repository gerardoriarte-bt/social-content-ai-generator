
import React, { useState } from 'react';
import { IdeaService } from '../services/ideaService';
import { CompanyService } from '../services/companyService';
import { AIParamsForm } from './AIParamsForm';
import { ContentIdea, Company, BusinessLine, AIParams } from '../types';

interface IdeaGeneratorProps {
  company: Company;
  businessLine: BusinessLine;
  onIdeasGenerated?: (ideas: ContentIdea[]) => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ company, businessLine, onIdeasGenerated }) => {
  const [numberOfIdeas, setNumberOfIdeas] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean | null>(null);
  const [aiParams, setAiParams] = useState<AIParams | null>(null);
  const [showAIParamsForm, setShowAIParamsForm] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);

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
        console.error('Error initializing:', error);
        // Set as connected by default to allow users to try
        setIsGeminiConnected(true);
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
      console.log('Generating ideas with retry logic...');
      const ideas = await IdeaService.generateIdeas(company.id, businessLine.id, numberOfIdeas);
      setGeneratedIdeas(ideas);
      onIdeasGenerated?.(ideas);
      
      // Si llegamos aquí, la generación fue exitosa
      console.log(`Successfully generated ${ideas.length} ideas`);
      
    } catch (error) {
      console.error('Error generating ideas:', error);
      
      // Handle specific Gemini errors
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          setError('⚠️ Gemini AI está experimentando alta demanda. Se han generado ideas de respaldo automáticamente. Puedes intentar de nuevo más tarde para obtener ideas personalizadas.');
          setIsGeminiConnected(false);
        } else if (error.message.includes('429')) {
          setError('⏰ Se ha excedido el límite de solicitudes. Por favor, espera un momento antes de intentar de nuevo.');
        } else if (error.message.includes('Failed to generate content ideas')) {
          setError('🔄 Se generaron ideas de respaldo debido a problemas temporales con la IA. Las ideas siguen siendo relevantes para tu negocio.');
        } else {
          setError(`❌ Error al generar ideas: ${error.message}`);
        }
      } else {
        setError('❌ Error inesperado al generar ideas. Por favor, intenta de nuevo.');
      }
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
          <div className={`w-3 h-3 rounded-full ${isGeminiConnected === null ? 'bg-yellow-400' : isGeminiConnected ? 'bg-green-400' : 'bg-orange-400'}`}></div>
          <span className="text-sm text-gray-600">
            {isGeminiConnected === null ? 'Conectando...' : isGeminiConnected ? 'Gemini AI Conectado' : 'Gemini AI con alta demanda - Usando ideas de respaldo'}
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

        {isGeminiConnected === false && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Gemini AI con alta demanda
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>El servicio está experimentando alta demanda. Puedes intentar generar ideas, pero es posible que falle temporalmente.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateIdeas}
          disabled={isGenerating || !aiParams}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isGenerating || !aiParams
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isGeminiConnected === false
              ? 'bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generando ideas...
            </div>
          ) : isGeminiConnected === false ? (
            '🔄 Generar Ideas (Con Respaldo Automático)'
          ) : (
            '🚀 Generar Ideas con IA'
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

      {/* Generated Ideas Section */}
      {generatedIdeas.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ideas Generadas ({generatedIdeas.length})
          </h3>
          <div className="space-y-4">
            {generatedIdeas.map((idea, index) => (
              <div key={idea.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {index + 1}. {idea.title}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {idea.platform}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Descripción:</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Justificación:</h5>
                    <p className="text-sm text-gray-600">{idea.rationale}</p>
                  </div>
                  
                  {idea.hashtags && idea.hashtags.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Hashtags:</h5>
                      <div className="flex flex-wrap gap-1">
                        {idea.hashtags.map((hashtag, tagIndex) => (
                          <span key={tagIndex} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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