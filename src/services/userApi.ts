import { apiClient } from "../utils/apiClient";

export const userApi = {
  list: () => apiClient.get('/api/users'),
  create: (registration: number, role: string, adminRfid: number) => apiClient.post('/api/users', { matricula: registration, role }, { 'x-rfid': adminRfid.toString() }),
  delete: (id: string, adminRfid: number) => apiClient.delete(`/api/users/${id}`, { 'x-rfid': adminRfid.toString() }),
}