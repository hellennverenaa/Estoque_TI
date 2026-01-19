import { apiClient } from '../utils/apiClient';

export type ApiMovimentationType = 'inbound' | 'outbound' | 'transfer' | 'adjustment';

export type ApiMovimentation = {
  id: string;
  type: ApiMovimentationType;
  product_id: string;
  movimented_by: number;
  quantity: number;
  product_old_quantity?: number;
  product_new_quantity?: number;
  local_storage?: string | null;
  product_old_local_storage?: string | null;
  appointment?: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    category: string;
  };
};

export type MovimentationsDashboardFilters = {
  limit?: number;
  year?: number;
  month?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
};

export type MovimentationsDashboardResponse = {
  success: boolean;
  message: string;
  data: {
    totalMovimentations: number;
    movimentationsByType: Record<ApiMovimentationType, number>;
    statsByType: Array<{
      type: ApiMovimentationType;
      count: number;
      totalQuantity: number;
    }>;
    recentMovimentations: ApiMovimentation[];
  };
  filters?: Record<string, unknown>;
};

export type CreateMovimentationPayload = {
  type: ApiMovimentationType;
  productId: string;
  responsibleUserId: number;
  quantity: number;
  newLocation?: string;
  notes?: string;
};

export const movimentationsApi = {
  list: () => apiClient.get<ApiMovimentation[]>('/api/movimentations'),

  getById: (id: string) => apiClient.get<ApiMovimentation>(`/api/movimentations/${id}`),

  listByProduct: (productId: string) =>
    apiClient.get<ApiMovimentation[]>(`/api/movimentations/product/${productId}`),

  dashboard: (filters?: MovimentationsDashboardFilters) =>
    apiClient.get<MovimentationsDashboardResponse>('/api/movimentations/dashboard', filters),

  create: (payload: CreateMovimentationPayload) => apiClient.post<ApiMovimentation>('/api/movimentations', payload)
};
