import { apiClient } from "../utils/apiClient";

export const dashboardApi = {
  movimentations: () => apiClient.get('/api/movimentations/stats/dashboard'),
  products: () => apiClient.get('/api/products/stats/dashboard')
}