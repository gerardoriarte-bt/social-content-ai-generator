import type { Company, IdeaGroup } from '../types';

const COMPANIES_KEY_BASE = 'social_content_ai_companies';
const IDEAS_KEY_BASE = 'social_content_ai_ideas';

// Companies Management
export const getCompanies = (userId: string): Company[] => {
  if (!userId) return [];
  const key = `${userId}_${COMPANIES_KEY_BASE}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveCompanies = (userId: string, companies: Company[]): void => {
  if (!userId) return;
  const key = `${userId}_${COMPANIES_KEY_BASE}`;
  localStorage.setItem(key, JSON.stringify(companies));
};

// Idea Groups Management
export const getIdeaGroups = (userId: string): IdeaGroup[] => {
  if (!userId) return [];
  const key = `${userId}_${IDEAS_KEY_BASE}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveIdeaGroups = (userId: string, ideaGroups: IdeaGroup[]): void => {
  if (!userId) return;
  const key = `${userId}_${IDEAS_KEY_BASE}`;
  localStorage.setItem(key, JSON.stringify(ideaGroups));
};

export const addIdeaGroup = (userId: string, ideaGroup: IdeaGroup): void => {
    const groups = getIdeaGroups(userId);
    saveIdeaGroups(userId, [ideaGroup, ...groups]);
};

export const updateIdeaGroup = (userId: string, updatedGroup: IdeaGroup): void => {
    const groups = getIdeaGroups(userId);
    const groupIndex = groups.findIndex(g => g.id === updatedGroup.id);
    if (groupIndex !== -1) {
        groups[groupIndex] = updatedGroup;
        saveIdeaGroups(userId, groups);
    }
};