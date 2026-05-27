import { apiClient } from "../utils/apiClient";
import type { ProductsDashboardResponse } from "./productsApi";
import type { MovimentationsDashboardResponse } from "./movimentationsApi";

export const dashboardApi = {
  movimentations: () => apiClient.get<MovimentationsDashboardResponse>('/movimentations/stats/dashboard'),
  products: () => apiClient.get<ProductsDashboardResponse>('/products/stats/dashboard')
}