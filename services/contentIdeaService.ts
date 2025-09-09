import { ContentIdea } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

export class ContentIdeaService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get all content ideas for a business line
  static async getContentIdeas(companyId: string, businessLineId: string): Promise<ContentIdea[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/content-ideas`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/content-ideas/${ideaId}`, {
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

  // Create a new content idea
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
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/content-ideas`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/content-ideas/${ideaId}`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/content-ideas/${ideaId}`, {
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
}
