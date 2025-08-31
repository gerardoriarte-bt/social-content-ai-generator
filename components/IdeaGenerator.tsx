import React, { useState, useCallback, useEffect } from 'react';
import { generateContentIdeas } from '../services/geminiService';
import { addIdeaGroup, updateIdeaGroup } from '../services/dataService';
import type { Company, BusinessLine, ContentIdea, AIParams, IdeaGroup, User } from '../types';
import { SparklesIcon, LightbulbIcon } from './icons';

interface IdeaGeneratorProps {
  company: Company;
  businessLine: BusinessLine;
  user: User;
  existingGroup?: IdeaGroup | null;
}

const aiParamOptions = {
  socialNetwork: ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'X (Twitter)'],
  contentType: ['Post', 'Story', 'Reel', 'Carousel', 'Article'],
  tone: ['Formal', 'Informal', 'Humorous', 'Inspirational', 'Serious', 'Empathetic'],
  intention: ['Educate', 'Entertain', 'Persuade', 'Convert', 'Inform'],
  emotion: ['Joy', 'Surprise', 'Trust', 'Anticipation', 'Excitement', 'Nostalgia'],
  character: ['Expert', 'Friend', 'Mentor', 'Entertainer', 'Motivator'],
};

const AIP_DEFAULTS: AIParams = {
    socialNetwork: 'Instagram',
    contentType: 'Post',
    tone: 'Informal',
    intention: 'Entertain',
    emotion: 'Joy',
    character: 'Friend',
}

const UpDownChevronIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);


const ParamSelector: React.FC<{ label: string; value: string; options: string[]; onChange: (value: string) => void;}> = ({ label, value, options, onChange}) => (
    <div>
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative mt-1">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full appearance-none px-4 py-2.5 pr-10 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-premium-red-500 sm:text-sm"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600">
                <UpDownChevronIcon className="w-5 h-5"/>
            </div>
        </div>
    </div>
);

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ company, businessLine, user, existingGroup: initialExistingGroup = null }) => {
  const [activeGroup, setActiveGroup] = useState<IdeaGroup | null>(initialExistingGroup);
  const [params, setParams] = useState<AIParams>(AIP_DEFAULTS);
  const [groupName, setGroupName] = useState('');
  const [objective, setObjective] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleRationales, setVisibleRationales] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // When the prop changes (e.g., navigating from repository), reset the active group and form
    setActiveGroup(initialExistingGroup);
    
    if (initialExistingGroup) {
        setGroupName(initialExistingGroup.name);
        setObjective(initialExistingGroup.objective);
        setParams(initialExistingGroup.params);
    } else {
        setGroupName('');
        setObjective('');
        setParams(AIP_DEFAULTS);
    }
    setGeneratedIdeas([]);
    setSelectedIdeas(new Set());
  }, [initialExistingGroup]);

  const handleParamChange = useCallback(<K extends keyof AIParams,>(param: K, value: AIParams[K]) => {
    setParams(prev => ({ ...prev, [param]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !objective.trim()) {
        setError("Group Name and Objective are required.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedIdeas([]);
    setSelectedIdeas(new Set());
    setVisibleRationales({});
    try {
      const ideas = await generateContentIdeas(businessLine, params, objective);
      setGeneratedIdeas(ideas);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdeas = () => {
    if (selectedIdeas.size === 0) {
        alert("Please select at least one idea to save.");
        return;
    }
    
    const ideasToSave = generatedIdeas.filter((_, index) => selectedIdeas.has(index));

    if (activeGroup) {
        const updatedGroup: IdeaGroup = {
            ...activeGroup,
            ideas: [...activeGroup.ideas, ...ideasToSave],
        };
        updateIdeaGroup(user.id, updatedGroup);
        setActiveGroup(updatedGroup); // Update local state to prevent staleness on next save
        alert(`${ideasToSave.length} more ideas added successfully to the group "${activeGroup.name}"!`);
    } else {
        const newIdeaGroup: IdeaGroup = {
          id: Date.now().toString(),
          name: groupName,
          objective,
          companyId: company.id,
          businessLineId: businessLine.id,
          companyName: company.name,
          businessLineName: businessLine.name,
          createdAt: new Date().toISOString(),
          ideas: ideasToSave,
          params,
        };
        addIdeaGroup(user.id, newIdeaGroup);
        alert(`${ideasToSave.length} ideas saved successfully to a new group!`);
    }
    
    // Clear the list of generated ideas for a clean slate
    setGeneratedIdeas([]);
    setSelectedIdeas(new Set());
  };
  
  const toggleRationale = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setVisibleRationales(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleIdeaSelection = (index: number) => {
    setSelectedIdeas(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedIdeas.size === generatedIdeas.length) {
        setSelectedIdeas(new Set());
    } else {
        const allIndices = new Set(generatedIdeas.map((_, i) => i));
        setSelectedIdeas(allIndices);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-md sticky top-24">
          <h2 className="text-2xl font-bold text-slate-900">{activeGroup ? 'Add More Ideas' : 'Generate New Ideas'}</h2>
          <p className="text-sm text-slate-600 mt-1">For <span className="font-semibold">{company.name} / {businessLine.name}</span></p>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Group Name</label>
                <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g., Q3 Product Launch" className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-premium-red-500 sm:text-sm read-only:bg-slate-200/50 read-only:cursor-not-allowed" required readOnly={!!activeGroup} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Objective</label>
                <textarea value={objective} onChange={e => setObjective(e.target.value)} placeholder="e.g., Drive awareness for the new product features" rows={3} className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-premium-red-500 sm:text-sm read-only:bg-slate-200/50 read-only:cursor-not-allowed" required readOnly={!!activeGroup}/>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 pt-4 border-t border-slate-200">AI Parameters</h3>
            {Object.entries(aiParamOptions).map(([key, options]) => (
                <ParamSelector key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={params[key as keyof AIParams]} options={options} onChange={(value) => handleParamChange(key as keyof AIParams, value)} />
            ))}
            
            <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 bg-premium-red-600 text-white text-base font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 disabled:bg-slate-400">
              <SparklesIcon className="w-5 h-5" />
              {isLoading ? 'Generating...' : 'Generate Ideas'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert"><p>{error}</p></div>}
        
        {isLoading && (
            <div className="text-center p-10 bg-white rounded-2xl shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-red-600 mx-auto"></div>
                <p className="mt-4 text-slate-700">AI is thinking... this may take a moment.</p>
            </div>
        )}

        {generatedIdeas.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Generated Ideas</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handleSelectAll} className="text-sm font-medium text-premium-red-600 hover:underline">
                            {selectedIdeas.size === generatedIdeas.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button 
                            onClick={handleSaveIdeas} 
                            disabled={selectedIdeas.size === 0}
                            className="px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Save ({selectedIdeas.size}) Selected
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {generatedIdeas.map((idea, index) => {
                        const isSelected = selectedIdeas.has(index);
                        return (
                            <div 
                                key={index} 
                                onClick={() => toggleIdeaSelection(index)}
                                className={`relative bg-white p-6 rounded-2xl shadow-md transition-all duration-200 cursor-pointer ${isSelected ? 'ring-2 ring-premium-red-500 shadow-lg' : 'hover:shadow-lg'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-premium-red-600 flex-1 pr-10">{idea.title}</h3>
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <button onClick={(e) => toggleRationale(e, index)} className="p-1 text-slate-400 hover:text-premium-yellow-500" title="Show AI Rationale">
                                            <LightbulbIcon className="w-5 h-5" />
                                        </button>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-premium-red-600' : 'bg-white border-2 border-slate-300'}`}>
                                            {isSelected && (
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-2 text-slate-700">{idea.description}</p>
                                {visibleRationales[index] && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm font-semibold text-premium-yellow-800">AI Rationale:</p>
                                        <p className="mt-1 text-sm text-yellow-700">{idea.rationale}</p>
                                    </div>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {idea.hashtags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {!isLoading && generatedIdeas.length === 0 && !error && (
             <div className="text-center p-10 bg-white rounded-2xl shadow-md">
                <SparklesIcon className="h-12 w-12 text-slate-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-slate-800">Ready to create?</h3>
                <p className="mt-1 text-sm text-slate-600">Fill out the form to generate your social media content ideas.</p>
            </div>
        )}
      </div>
    </div>
  );
};