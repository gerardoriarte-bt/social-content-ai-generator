import { ContentIdea, AIParams } from './types';

const API_BASE_URL = '/api';

export class IdeaService {
  private static getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Generate content ideas using AI
  static async generateIdeas(companyId: string, businessLineId: string, numberOfIdeas: number = 5): Promise<ContentIdea[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/companies/${companyId}/business-lines/${businessLineId}/generate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ numberOfIdeas }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ideas');
      }

      const data = await response.json();
      return data.ideas;
    } catch (error) {
      console.error('Error generating ideas:', error);
      throw error;
    }
  }

  // Get all content ideas for a business line
  static async getContentIdeas(companyId: string, businessLineId: string): Promise<ContentIdea[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/companies/${companyId}/business-lines/${businessLineId}/ideas`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get content ideas');
      }

      const data = await response.json();
      return data.ideas;
    } catch (error) {
      console.error('Error getting content ideas:', error);
      throw error;
    }
  }

  // Get a specific content idea
  static async getContentIdea(companyId: string, businessLineId: string, ideaId: string): Promise<ContentIdea> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/companies/${companyId}/business-lines/${businessLineId}/ideas/${ideaId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get content idea');
      }

      const data = await response.json();
      return data.idea;
    } catch (error) {
      console.error('Error getting content idea:', error);
      throw error;
    }
  }

  // Create a new content idea manually
  static async createContentIdea(
    companyId: string, 
    businessLineId: string, 
    ideaData: {
      title: string;
      description: string;
      rationale: string;
      platform: string;
      hashtags: string[];
    }
  ): Promise<ContentIdea> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/companies/${companyId}/business-lines/${businessLineId}/ideas`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(ideaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create content idea');
      }

      const data = await response.json();
      return data.idea;
    } catch (error) {
      console.error('Error creating content idea:', error);
      throw error;
    }
  }

  // Update a content idea
  static async updateContentIdea(
    companyId: string,
    businessLineId: string,
    ideaId: string,
    ideaData: {
      title?: string;
      description?: string;
      rationale?: string;
      platform?: string;
      hashtags?: string[];
    }
  ): Promise<ContentIdea> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/companies/${companyId}/business-lines/${businessLineId}/ideas/${ideaId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(ideaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update content idea');
      }

      const data = await response.json();
      return data.idea;
    } catch (error) {
      console.error('Error updating content idea:', error);
      throw error;
    }
  }

  // Delete a content idea
  static async deleteContentIdea(companyId: string, businessLineId: string, ideaId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/companies/${companyId}/business-lines/${businessLineId}/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete content idea');
      }
    } catch (error) {
      console.error('Error deleting content idea:', error);
      throw error;
    }
  }

  // Test Gemini AI connection
  static async testGeminiConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/ideas/test-gemini`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'connected';
    } catch (error) {
      console.error('Error testing Gemini connection:', error);
      return false;
    }
  }
}
