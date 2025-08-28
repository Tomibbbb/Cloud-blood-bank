// Hospital API service for dashboard and stock management
export interface DashboardStats {
  totalBloodUnits: number;
  bloodTypesAvailable: number;
  pendingRequests: number;
  criticalStock: number;
  expiringSoon: number;
  stockDetails: StockDetail[];
}

export interface StockDetail {
  bloodType: string;
  unitsAvailable: number;
  expiryDate?: string;
  isExpiringSoon: boolean;
  isCritical: boolean;
}

export interface HospitalStock {
  id: number;
  hospitalId: number;
  bloodType: string;
  unitsAvailable: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  stocks?: T;
  [key: string]: any;
}

class HospitalApiService {
  private baseUrl = 'http://localhost:3000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        console.error('Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/hospital/login';
        throw new Error('Authentication required');
      }
      
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error(`API Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const url = `${this.baseUrl}/hospital-stock/dashboard/stats`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await this.handleResponse<ApiResponse<DashboardStats>>(response);
      
      // Extract the stats from the response (removing the message property)
      const { message, ...stats } = data;
      return stats as DashboardStats;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - is the backend server running?', error);
        throw new Error('Cannot connect to server. Please check if the backend is running on http://localhost:3000 (API at http://localhost:3000/api)');
      }
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  async getHospitalStock(): Promise<HospitalStock[]> {
    try {
      const response = await fetch(`${this.baseUrl}/hospital-stock`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await this.handleResponse<ApiResponse<HospitalStock[]>>(response);
      return data.stocks || [];
    } catch (error) {
      console.error('Failed to fetch hospital stock:', error);
      throw error;
    }
  }

  async createStock(stockData: {
    bloodType: string;
    unitsAvailable: number;
    expiryDate?: string;
  }): Promise<HospitalStock> {
    try {
      const response = await fetch(`${this.baseUrl}/hospital-stock`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(stockData),
      });

      const data = await this.handleResponse<ApiResponse<HospitalStock>>(response);
      return data.stock || data.data!;
    } catch (error) {
      console.error('Failed to create stock:', error);
      throw error;
    }
  }

  async updateStock(id: number, stockData: {
    bloodType?: string;
    unitsAvailable?: number;
    expiryDate?: string;
  }): Promise<HospitalStock> {
    try {
      const response = await fetch(`${this.baseUrl}/hospital-stock/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(stockData),
      });

      const data = await this.handleResponse<ApiResponse<HospitalStock>>(response);
      return data.stock || data.data!;
    } catch (error) {
      console.error('Failed to update stock:', error);
      throw error;
    }
  }

  async deleteStock(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/hospital-stock/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      await this.handleResponse<ApiResponse<void>>(response);
    } catch (error) {
      console.error('Failed to delete stock:', error);
      throw error;
    }
  }
}

export const hospitalApi = new HospitalApiService();