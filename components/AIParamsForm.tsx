import React, { useState, useEffect } from 'react';
import { CompanyService } from '../services/companyService';
import { Modal } from './Modal';
import type { AIParams } from '../types';

interface AIParamsFormProps {
  companyId: string;
  businessLineId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (aiParams: AIParams) => void;
}

export const AIParamsForm: React.FC<AIParamsFormProps> = ({
  companyId,
  businessLineId,
  isOpen,
  onClose,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiParams, setAiParams] = useState<Partial<AIParams>>({
    tone: 'Profesional y amigable',
    characterType: 'Experto en la industria',
    targetAudience: 'Clientes potenciales y existentes',
    contentType: 'Posts informativos y promocionales',
    socialNetwork: 'Instagram',
    contentFormat: 'Post',
    objective: 'Awareness',
    focus: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadAIParams();
    }
  }, [isOpen, businessLineId]);

  const loadAIParams = async () => {
    try {
      const existingParams = await CompanyService.getAIParams(companyId, businessLineId);
      if (existingParams) {
        setAiParams(existingParams);
      }
    } catch (error) {
      console.error('Error loading AI params:', error);
    }
  };

  const handleSave = async () => {
    if (!aiParams.tone || !aiParams.characterType || !aiParams.targetAudience || !aiParams.contentType || !aiParams.socialNetwork || !aiParams.contentFormat || !aiParams.objective) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      let savedParams: AIParams;
      
      if (aiParams.id) {
        // Update existing params
        savedParams = await CompanyService.updateAIParams(
          companyId,
          businessLineId,
          aiParams.id,
          {
            tone: aiParams.tone,
            characterType: aiParams.characterType,
            targetAudience: aiParams.targetAudience,
            contentType: aiParams.contentType,
            socialNetwork: aiParams.socialNetwork,
            contentFormat: aiParams.contentFormat,
            objective: aiParams.objective,
            focus: aiParams.focus,
          }
        );
      } else {
        // Create new params
        savedParams = await CompanyService.createAIParams(
          companyId,
          businessLineId,
          {
            tone: aiParams.tone,
            characterType: aiParams.characterType,
            targetAudience: aiParams.targetAudience,
            contentType: aiParams.contentType,
            socialNetwork: aiParams.socialNetwork,
            contentFormat: aiParams.contentFormat,
            objective: aiParams.objective,
            focus: aiParams.focus,
          }
        );
      }
      
      onSave(savedParams);
      onClose();
    } catch (error) {
      console.error('Error saving AI params:', error);
      alert('Error al guardar los parámetros de IA. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Configurar Parámetros de IA
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tono de Comunicación
            </label>
            <select
              value={aiParams.tone || ''}
              onChange={(e) => setAiParams({ ...aiParams, tone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
            >
              <option value="">Selecciona un tono</option>
              <option value="Profesional y formal">Profesional y formal</option>
              <option value="Profesional y amigable">Profesional y amigable</option>
              <option value="Casual y cercano">Casual y cercano</option>
              <option value="Divertido y entretenido">Divertido y entretenido</option>
              <option value="Inspirador y motivacional">Inspirador y motivacional</option>
              <option value="Educativo e informativo">Educativo e informativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Personaje
            </label>
            <select
              value={aiParams.characterType || ''}
              onChange={(e) => setAiParams({ ...aiParams, characterType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
            >
              <option value="">Selecciona un tipo de personaje</option>
              <option value="Experto en la industria">Experto en la industria</option>
              <option value="Consultor especializado">Consultor especializado</option>
              <option value="Amigo confiable">Amigo confiable</option>
              <option value="Mentor inspirador">Mentor inspirador</option>
              <option value="Storyteller creativo">Storyteller creativo</option>
              <option value="Analista de datos">Analista de datos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Audiencia Objetivo
            </label>
            <select
              value={aiParams.targetAudience || ''}
              onChange={(e) => setAiParams({ ...aiParams, targetAudience: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
            >
              <option value="">Selecciona la audiencia</option>
              <option value="Clientes potenciales">Clientes potenciales</option>
              <option value="Clientes existentes">Clientes existentes</option>
              <option value="Clientes potenciales y existentes">Clientes potenciales y existentes</option>
              <option value="Profesionales del sector">Profesionales del sector</option>
              <option value="Jóvenes profesionales">Jóvenes profesionales</option>
              <option value="Empresarios y ejecutivos">Empresarios y ejecutivos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Contenido
            </label>
            <select
              value={aiParams.contentType || ''}
              onChange={(e) => setAiParams({ ...aiParams, contentType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
            >
              <option value="">Selecciona el tipo de contenido</option>
              <option value="Posts informativos">Posts informativos</option>
              <option value="Posts promocionales">Posts promocionales</option>
              <option value="Posts informativos y promocionales">Posts informativos y promocionales</option>
              <option value="Contenido educativo">Contenido educativo</option>
              <option value="Casos de éxito">Casos de éxito</option>
              <option value="Tips y consejos">Tips y consejos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Red Social
            </label>
            <select
              value={aiParams.socialNetwork || ''}
              onChange={(e) => setAiParams({ ...aiParams, socialNetwork: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
            >
              <option value="">Selecciona la red social</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Twitter">Twitter</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Formato de Contenido
            </label>
            <select
              value={aiParams.contentFormat || ''}
              onChange={(e) => setAiParams({ ...aiParams, contentFormat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
            >
              <option value="">Selecciona el formato</option>
              <option value="Post">Post (Copy para imagen)</option>
              <option value="Story">Story (Copy corto)</option>
              <option value="Carrusel">Carrusel (3+ slides con copy)</option>
              <option value="Reels">Reels (Guión para video)</option>
              <option value="Video">Video (Guión largo)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Objetivo del Contenido
            </label>
            <select
              value={aiParams.objective || ''}
              onChange={(e) => setAiParams({ ...aiParams, objective: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
            >
              <option value="">Selecciona el objetivo</option>
              <option value="Awareness">Awareness (Reconocimiento de marca)</option>
              <option value="Engagement">Engagement (Interacción)</option>
              <option value="Conversion">Conversión (Ventas)</option>
              <option value="Traffic">Tráfico (Visitas al sitio)</option>
              <option value="Education">Educación (Información)</option>
              <option value="Community">Comunidad (Construir comunidad)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enfoque de las Ideas
            </label>
            <input
              type="text"
              value={aiParams.focus || ''}
              onChange={(e) => setAiParams({ ...aiParams, focus: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premium-red-500"
              placeholder="Ej: Sostenibilidad, innovación tecnológica, servicio al cliente..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !aiParams.tone || !aiParams.characterType || !aiParams.targetAudience || !aiParams.contentType || !aiParams.socialNetwork || !aiParams.contentFormat || !aiParams.objective}
            className="px-4 py-2 bg-premium-red-600 text-white rounded-md hover:bg-premium-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar Parámetros'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
