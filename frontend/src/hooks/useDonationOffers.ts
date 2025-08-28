'use client';

import { useState, useCallback } from 'react';

// TODO: Replace with your actual API client/fetcher
// import { apiClient } from '../lib/api';

export interface DonationOffer {
  id: number;
  bloodType: string;
  preferredDate: string;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  routedToId?: number;
  routedToName?: string;
  appointmentDate?: string;
  hospitalNotes?: string;
  rejectionReason?: string;
  donor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferData {
  bloodType: string;
  preferredDate: string;
  location: string;
  notes?: string;
}

export interface ConfirmOfferData {
  appointmentDate: string;
  hospitalNotes?: string;
}

export interface RejectOfferData {
  rejectionReason: string;
}

export interface OfferFilters {
  status?: string;
  bloodType?: string;
  startDate?: string;
  endDate?: string;
  hospitalId?: string;
}

export interface OfferStats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
}

// Hook for donors to create offers
export const useCreateOffer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffer = useCallback(async (data: CreateOfferData): Promise<DonationOffer | null> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/donations/offers', data);
      // return response.data.offer;

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOffer: DonationOffer = {
        id: Math.floor(Math.random() * 1000),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return mockOffer;
    } catch (err: any) {
      setError(err.message || 'Failed to create offer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOffer, loading, error };
};

// Hook for donors to get their offers
export const useMyOffers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<DonationOffer[]>([]);

  const fetchOffers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/donations/offers/mine');
      // setOffers(response.data.offers);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOffers([]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOffer = useCallback(async (offerId: number): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // await apiClient.patch(`/donations/offers/${offerId}/cancel`);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'cancelled' as const }
          : offer
      ));
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel offer');
      return false;
    }
  }, []);

  return { offers, fetchOffers, cancelOffer, loading, error };
};

// Hook for hospitals to get routed offers
export const useHospitalOffers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<DonationOffer[]>([]);

  const fetchOffers = useCallback(async (filters?: OfferFilters): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams(filters as any);
      // const response = await apiClient.get(`/donations/offers/inbox?${params}`);
      // setOffers(response.data.offers);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOffers([]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, []);

  return { offers, fetchOffers, loading, error };
};

// Hook for hospitals to confirm offers
export const useConfirmOffer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmOffer = useCallback(async (offerId: number, data: ConfirmOfferData): Promise<DonationOffer | null> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.patch(`/donations/offers/${offerId}/confirm`, data);
      // return response.data.offer;

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return null; // Should return updated offer
    } catch (err: any) {
      setError(err.message || 'Failed to confirm offer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { confirmOffer, loading, error };
};

// Hook for hospitals to reject offers
export const useRejectOffer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectOffer = useCallback(async (offerId: number, data: RejectOfferData): Promise<DonationOffer | null> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.patch(`/donations/offers/${offerId}/reject`, data);
      // return response.data.offer;

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return null; // Should return updated offer
    } catch (err: any) {
      setError(err.message || 'Failed to reject offer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { rejectOffer, loading, error };
};

// Hook for admins to get all offers with stats
export const useAllOffers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [stats, setStats] = useState<OfferStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
  });

  const fetchOffers = useCallback(async (filters?: OfferFilters): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams(filters as any);
      // const response = await apiClient.get(`/donations/offers/all?${params}`);
      // setOffers(response.data.offers);
      // setStats(response.data.stats);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOffers([]);
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        rejected: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, []);

  return { offers, stats, fetchOffers, loading, error };
};

// General hook for any offer operations
export const useDonationOffers = () => {
  return {
    useCreateOffer,
    useMyOffers,
    useHospitalOffers,
    useConfirmOffer,
    useRejectOffer,
    useAllOffers,
  };
};