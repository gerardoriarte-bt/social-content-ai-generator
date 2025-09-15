import { Company, BusinessLine, AIParams } from './types';

const API_BASE_URL = '/api';

export class CompanyService {
  private static getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Get all companies for the current user
  static async getCompanies(): Promise<Company[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get companies');
      }

      const data = await response.json();
      return data.companies;
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  }

  // Get a specific company
  static async getCompany(companyId: string): Promise<Company> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get company');
      }

      const data = await response.json();
      return data.company;
    } catch (error) {
      console.error('Error getting company:', error);
      throw error;
    }
  }

  // Create a new company
  static async createCompany(companyData: {
    name: string;
    description: string;
    industry: string;
  }): Promise<Company> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }

      const data = await response.json();
      return data.company;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Update a company
  static async updateCompany(
    companyId: string,
    companyData: {
      name?: string;
      description?: string;
      industry?: string;
    }
  ): Promise<Company> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }

      const data = await response.json();
      return data.company;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Delete a company
  static async deleteCompany(companyId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // Get business lines for a company
  static async getBusinessLines(companyId: string): Promise<BusinessLine[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get business lines');
      }

      const data = await response.json();
      return data.businessLines;
    } catch (error) {
      console.error('Error getting business lines:', error);
      throw error;
    }
  }

  // Create a business line
  static async createBusinessLine(
    companyId: string,
    businessLineData: {
      name: string;
      description: string;
    }
  ): Promise<BusinessLine> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(businessLineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create business line');
      }

      const data = await response.json();
      return data.businessLine;
    } catch (error) {
      console.error('Error creating business line:', error);
      throw error;
    }
  }

  // Update a business line
  static async updateBusinessLine(
    companyId: string,
    businessLineId: string,
    businessLineData: {
      name?: string;
      description?: string;
    }
  ): Promise<BusinessLine> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(businessLineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update business line');
      }

      const data = await response.json();
      return data.businessLine;
    } catch (error) {
      console.error('Error updating business line:', error);
      throw error;
    }
  }

  // Delete a business line
  static async deleteBusinessLine(companyId: string, businessLineId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete business line');
      }
    } catch (error) {
      console.error('Error deleting business line:', error);
      throw error;
    }
  }

  // Get AI parameters for a business line
  static async getAIParams(companyId: string, businessLineId: string): Promise<AIParams | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/ai-params`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI parameters');
      }

      const data = await response.json();
      return data.aiParams;
    } catch (error) {
      console.error('Error getting AI parameters:', error);
      throw error;
    }
  }

  // Create AI parameters
  static async createAIParams(
    companyId: string,
    businessLineId: string,
    aiParamsData: {
      tone: string;
      characterType: string;
      targetAudience: string;
      contentType: string;
      socialNetwork: string;
      contentFormat: string;
      objective: string;
      focus: string;
    }
  ): Promise<AIParams> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/ai-params`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(aiParamsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create AI parameters');
      }

      const data = await response.json();
      return data.aiParams;
    } catch (error) {
      console.error('Error creating AI parameters:', error);
      throw error;
    }
  }

  // Update AI parameters
  static async updateAIParams(
    companyId: string,
    businessLineId: string,
    aiParamsId: string,
    aiParamsData: {
      tone?: string;
      characterType?: string;
      targetAudience?: string;
      contentType?: string;
      socialNetwork?: string;
      contentFormat?: string;
      objective?: string;
      focus?: string;
    }
  ): Promise<AIParams> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/business-lines/${businessLineId}/ai-params/${aiParamsId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(aiParamsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update AI parameters');
      }

      const data = await response.json();
      return data.aiParams;
    } catch (error) {
      console.error('Error updating AI parameters:', error);
      throw error;
    }
  }
}
