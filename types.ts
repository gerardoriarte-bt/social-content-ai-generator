
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Company {
  id: string;
  name: string;
  businessLines: BusinessLine[];
}

export interface BusinessLine {
  id: string;
  name: string;
  context: string;
}

export interface ContentIdea {
  title: string;
  description: string;
  hashtags: string[];
  rationale: string;
}

export interface IdeaGroup {
  id: string;
  name: string;
  objective: string;
  companyId: string;
  businessLineId: string;
  companyName?: string;
  businessLineName?: string;
  createdAt: string;
  ideas: ContentIdea[];
  params: AIParams;
}

export interface AIParams {
  socialNetwork: string;
  contentType: string;
  tone: string;
  intention: string;
  emotion: string;
  character: string;
}