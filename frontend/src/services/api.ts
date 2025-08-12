export interface CreateUserDto {
  firstName: string; lastName: string; email: string; password: string;
}

export interface LoginUserDto {
  email: string; password: string;
}

export interface UserProfile {
  id: number; firstName: string; lastName: string; email: string;
  role: 'admin' | 'donor' | 'hospital'; phone?: string; bloodType?: string; address?: string;
}

export interface AuthResponse {
  message: string; user: UserProfile; token: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const createAuthHeaders = (token: string) => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

export interface DonorProfile {
  id?: number; firstName: string; lastName: string; email: string; phone: string;
  bloodType: string; dateOfBirth?: string; weight?: number; height?: number;
  address?: string; medicalHistory?: string; emergencyContact?: string; emergencyPhone?: string;
}

export interface CreateDonorDto {
  firstName: string; lastName: string; email: string; phone: string; bloodType: string;
  dateOfBirth?: string; weight?: number; height?: number; address?: string;
  medicalHistory?: string; emergencyContact?: string; emergencyPhone?: string;
}

export const authApi = {
  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },

  login: async (credentials: LoginUserDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  verifyToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  getProfile: async (token: string): Promise<UserProfile> => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get profile');
    }

    return response.json();
  },
};

export const donorApi = {
  createProfile: async (token: string, donorData: CreateDonorDto): Promise<DonorProfile> => {
    const response = await fetch(`${API_URL}/donors`, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify(donorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create donor profile');
    }

    const result = await response.json();
    return result.donor;
  },

  getProfile: async (token: string, donorId: number): Promise<DonorProfile> => {
    const response = await fetch(`${API_URL}/donors/${donorId}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get donor profile');
    }

    const result = await response.json();
    return result.donor;
  },

  updateProfile: async (token: string, donorId: number, updateData: Partial<CreateDonorDto>): Promise<DonorProfile> => {
    const response = await fetch(`${API_URL}/donors/${donorId}`, {
      method: 'PUT',
      headers: createAuthHeaders(token),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update donor profile');
    }

    const result = await response.json();
    return result.donor;
  },

  // Get current authenticated user's donor profile
  getMyProfile: async (token: string): Promise<DonorProfile | null> => {
    const response = await fetch(`${API_URL}/donors/my-profile`, {
      headers: createAuthHeaders(token),
    });

    if (response.status === 404) {
      // No donor profile exists yet
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get donor profile');
    }

    const result = await response.json();
    return result.donor;
  },
};

// Dashboard-related interfaces and API calls
export interface DonationRecord {
  id: number;
  date: string;
  units: number;
  hospital: string;
  status: 'completed' | 'pending' | 'cancelled';
  bloodType: string;
}

export interface UrgentBloodRequest {
  id: number;
  bloodType: string;
  hospital: string;
  unitsNeeded: number;
  priority: 'urgent' | 'critical';
  postedAt: string;
}

export interface DonorStats {
  totalDonations: number;
  totalUnits: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  donorSince: string;
}

export const dashboardApi = {
  getDonationHistory: async (token: string): Promise<DonationRecord[]> => {
    const response = await fetch(`${API_URL}/donors/donations`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get donation history');
    }

    const result = await response.json();
    return result.donations || [];
  },

  getUrgentRequests: async (token: string): Promise<UrgentBloodRequest[]> => {
    const response = await fetch(`${API_URL}/blood-requests/urgent`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get urgent requests');
    }

    const result = await response.json();
    return result.requests || [];
  },

  getDonorStats: async (token: string): Promise<DonorStats> => {
    const response = await fetch(`${API_URL}/donors/stats`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get donor stats');
    }

    const result = await response.json();
    return result.stats;
  },
};