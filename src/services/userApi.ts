import { apiClient } from "../utils/apiClient";

export const userApi = {
  list: () => apiClient.get('/api/users'),
  create: (registration: number) => apiClient.post('/api/users', { matricula: registration }),
  delete: (id: string) => apiClient.delete(`/api/users/${id}`),
}