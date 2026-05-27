import { apiClient } from "../utils/apiClient";

export const userApi = {
  list: () => apiClient.get('/users'),
  create: (registration: number | string, role: string, adminRfid: number) => apiClient.post('/users', { matricula: registration, role }, { 'x-rfid': adminRfid.toString() }),
  delete: (id: string, adminRfid: number) => apiClient.delete(`/users/${id}`, { 'x-rfid': adminRfid.toString() }),
  updateRole: (id: string, role: string, adminRfid: number) => apiClient.patch(`/users/${id}/role`, { role }, { 'x-rfid': adminRfid.toString() }),
}