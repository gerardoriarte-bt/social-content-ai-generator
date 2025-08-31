import React, { useState, useEffect } from 'react';
import { getIdeaGroups } from '../services/dataService';
import type { IdeaGroup, User } from '../types';
import { SparklesIcon, LightbulbIcon } from './icons';

interface IdeaRepositoryProps {
    onGenerateMore: (group: IdeaGroup) => void;
    user: User;
}

export const IdeaRepository: React.FC<IdeaRepositoryProps> = ({ onGenerateMore, user }) => {
  const [ideaGroups, setIdeaGroups] = useState<IdeaGroup[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [visibleRationales, setVisibleRationales] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIdeaGroups(getIdeaGroups(user.id));
  }, [user]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };
  
  const toggleRationale = (groupId: string, ideaIndex: number) => {
    const key = `${groupId}-${ideaIndex}`;
    setVisibleRationales(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Idea Repository</h1>
      
      {ideaGroups.length > 0 ? (
        <div className="space-y-4">
          {ideaGroups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full text-left p-4 sm:p-6 flex justify-between items-center hover:bg-slate-100/50 transition-colors focus:outline-none"
              >
                <div>
                  <p className="text-lg font-semibold text-premium-red-600">{group.name}</p>
                  <p className="text-sm text-slate-600">
                    {group.companyName} / {group.businessLineName} - {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <svg className={`w-5 h-5 text-slate-500 transform transition-transform duration-200 ease-in-out ${expandedGroup === group.id ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {expandedGroup === group.id && (
                <div className="p-4 sm:p-6 border-t border-slate-200">
                    <h3 className="text-md font-semibold text-slate-800">Objective:</h3>
                    <p className="mb-6 text-sm text-slate-700 italic">"{group.objective}"</p>

                    <div className="space-y-4">
                        {group.ideas.map((idea, index) => (
                            <div key={index} className="bg-slate-100 p-4 rounded-xl">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-slate-900 flex-1 pr-4">{idea.title}</h4>
                                    <button onClick={() => toggleRationale(group.id, index)} className="p-1 text-slate-400 hover:text-premium-yellow-500" title="Show AI Rationale">
                                        <LightbulbIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="mt-1 text-sm text-slate-700">{idea.description}</p>
                                {visibleRationales[`${group.id}-${index}`] && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm font-semibold text-premium-yellow-800">AI Rationale:</p>
                                        <p className="mt-1 text-sm text-yellow-700">{idea.rationale}</p>
                                    </div>
                                )}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {idea.hashtags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 text-right">
                        <button
                            onClick={() => onGenerateMore(group)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-premium-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-premium-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-red-600"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Generate More Ideas
                        </button>
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
            <SparklesIcon className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-slate-800">Your repository is empty</h3>
            <p className="mt-1 text-sm text-slate-600">Generated ideas will be saved here for future reference.</p>
        </div>
      )}
    </div>
  );
};