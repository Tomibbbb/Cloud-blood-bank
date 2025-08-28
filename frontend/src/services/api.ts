export interface CreateUserDto {
  firstName: string; lastName: string; email: string; password: string;
}

export interface LoginDto {
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

  login: async (credentials: LoginDto): Promise<AuthResponse> => {
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

// Donation offers interfaces and API
export interface DonationOffer {
  id: number;
  bloodType: string;
  preferredDate: string;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  donor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  routedToId?: number;
  routedToName?: string;
  appointmentDate?: string;
  hospitalNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface DonationOfferQueryParams {
  status?: string;
  bloodType?: string;
  page?: number;
  limit?: number;
}

export interface ConfirmDonationOfferDto {
  appointmentDate: string;
  hospitalNotes?: string;
}

export interface RejectDonationOfferDto {
  rejectionReason: string;
}

export const donationOffersApi = {
  getHospitalOffers: async (token: string, query?: DonationOfferQueryParams): Promise<DonationOffer[]> => {
    const queryParams = query ? new URLSearchParams(query as any).toString() : '';
    const url = queryParams ? `${API_URL}/donations/offers/inbox?${queryParams}` : `${API_URL}/donations/offers/inbox`;
    
    const response = await fetch(url, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get hospital offers');
    }

    const result = await response.json();
    return result.offers || [];
  },

  confirmOffer: async (token: string, offerId: number, confirmData: ConfirmDonationOfferDto): Promise<DonationOffer> => {
    const response = await fetch(`${API_URL}/donations/offers/${offerId}/confirm`, {
      method: 'PATCH',
      headers: createAuthHeaders(token),
      body: JSON.stringify(confirmData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to confirm offer');
    }

    const result = await response.json();
    return result.offer;
  },

  rejectOffer: async (token: string, offerId: number, rejectData: RejectDonationOfferDto): Promise<DonationOffer> => {
    const response = await fetch(`${API_URL}/donations/offers/${offerId}/reject`, {
      method: 'PATCH',
      headers: createAuthHeaders(token),
      body: JSON.stringify(rejectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject offer');
    }

    const result = await response.json();
    return result.offer;
  },

  getAllOffers: async (token: string, query?: DonationOfferQueryParams): Promise<DonationOffer[]> => {
    const queryParams = query ? new URLSearchParams(query as any).toString() : '';
    const url = queryParams ? `${API_URL}/donations/offers/all?${queryParams}` : `${API_URL}/donations/offers/all`;
    
    const response = await fetch(url, {
      headers: createAuthHeaders(token),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get all offers');
    }
    const result = await response.json();
    return result.offers || [];
  },
};

// Blood Request API
export interface CreateDonorBloodRequestDto {
  bloodType: string;
  units: number;
  reason?: string;
  preferredHospitalId?: number;
}

export interface BloodRequestResponse {
  message: string;
  request: any;
}

export const bloodRequestApi = {
  createDonorBloodRequest: async (token: string, requestData: CreateDonorBloodRequestDto): Promise<BloodRequestResponse> => {
    const response = await fetch(`${API_URL}/requests/donor/request-blood`, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create blood request');
    }

    return response.json();
  },

  getHospitals: async (token: string): Promise<{ id: number; name: string }[]> => {
    return [
      { id: 15, name: 'Royal London Hospital' },
      { id: 16, name: 'St. Bartholomews Hospital' },
      { id: 11, name: 'City General Hospital' },
      { id: 3, name: 'St. Mary Medical Center' },
    ];
  },
};