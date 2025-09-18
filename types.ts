
// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Company types
export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Business Line types
export interface BusinessLine {
  id: string;
  name: string;
  description: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// AI Parameters types
export interface AIParams {
  id: string;
  businessLineId: string;
  tone: string;
  characterType: string;
  targetAudience: string;
  contentType: string;
  socialNetwork: string;
  contentFormat: string;
  objective: string;
  focus: string;
  createdAt: string;
  updatedAt: string;
}

// Content Idea types
export interface ContentIdea {
  id: string;
  businessLineId: string;
  title: string;
  description: string;
  rationale: string;
  platform: string;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

// Idea Group types
export interface IdeaGroup {
  id: string;
  name: string;
  companyId: string;
  businessLineId: string;
  aiParamsId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Hashtag types
export interface Hashtag {
  id: string;
  name: string;
  category: string;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}