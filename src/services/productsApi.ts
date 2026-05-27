import { apiClient } from '../utils/apiClient';

export type ApiProduct = {
  id: string;
  name: string;
  category: string;
  codigo?: string | null;
  serial_number?: string | null;
  minimal_quantity: number;
  quantity: number;
  loaned_quantity?: number;
  value?: number | null;
  local_storage?: string | null;
  created_by: number
  created_at?: string;
  updated_at?: string;
};

export type ApiProductResponse = {
  success: boolean;
  data: ApiProduct[];
  count: number;
  filters?: Record<string, unknown> | null;
  message?: string;
};

export type ApiSingleProductResponse = {
  success: boolean;
  data: ApiProduct;
  message?: string;
};

export type ProductListFilters = {
  category?: string;
  stock_status?: 'in_stock' | 'out_stock' | 'low_stock';
  codigo?: string;
  serial_number?: string;
  local_storage?: string;
};

export type ProductsDashboardFilters = ProductListFilters & {
  year?: number;
  month?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
};

export type ProductsDashboardResponse = {
  success: boolean;
  data: {
    totalMaterials: number;
    totalQuantity: number;
    totalStockValue: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    statsByCategory: Array<{
      category: string;
      totalMaterials: number;
      totalQuantity: number;
      totalValue: number;
    }>;
    statsByLocation: Array<{
      location: string;
      totalMaterials: number;
      totalQuantity: number;
      totalValue: number;
    }>;
  };
  filters?: Record<string, unknown>;
};

export type CreateProductPayload = {
  name: string;
  category: string;
  codigo?: string;
  serial_number?: string;
  minimal_quantity?: number;
  quantity?: number;
  value?: number | string;
  local_storage?: string;
  created_by: number | string;
};

export type UpdateProductDTO = {
  name?: string;
  category?: string;
  codigo?: string;
  serial_number?: string;
  minimal_quantity?: number;
  quantity?: number;
  value?: number | string;
  local_storage?: string;
  editReason?: string
}

export type UpdateProductPayload = UpdateProductDTO & { updated_by: number; }

export const productsApi = {
  list: (filters?: ProductListFilters) => apiClient.get<ApiProductResponse>('/products', filters),

  getById: (id: string) => apiClient.get<ApiSingleProductResponse>(`/products/${id}`),

  create: (payload: CreateProductPayload, userRfid: number | string) => apiClient.post<ApiSingleProductResponse>('/products', 
    payload,
    {
      'x-rfid': userRfid.toString()
    }
  ),

  update: (id: string, payload: UpdateProductPayload, userRfid: number) =>
    apiClient.patch<ApiSingleProductResponse>(`/products/${id}`,
      payload,
      {
        'x-rfid': userRfid.toString()
      }
    ),

  remove: (id: string, userRfid: number | string) => apiClient.delete<{ message: string }>(`/products/${id}`, {
    'x-rfid': userRfid.toString()
  }),

  replenish: (id: string) => apiClient.post<{ success: boolean; message: string }>(`/products/${id}/replenish`),

  dashboardStats: (filters?: ProductsDashboardFilters) =>
    apiClient.get<ProductsDashboardResponse>('/products/stats/dashboard', filters)
};
