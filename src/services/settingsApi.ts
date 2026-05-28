import { apiClient } from '../utils/apiClient';

export interface StorageLocation {
  id: string;
  name: string;
}

export interface Sector {
  id: string;
  name: string;
}

export const settingsApi = {
  // Locations
  getLocations: async (): Promise<StorageLocation[]> => {
    return await apiClient.get<StorageLocation[]>('/settings/locations');
  },
  createLocation: async (name: string, adminRfid: number): Promise<StorageLocation> => {
    return await apiClient.post<StorageLocation>('/settings/locations', { name, adminRfid });
  },
  updateLocation: async (id: string, name: string, adminRfid: number): Promise<StorageLocation> => {
    return await apiClient.patch<StorageLocation>(`/settings/locations/${id}`, { name, adminRfid });
  },
  deleteLocation: async (id: string, adminRfid: number): Promise<void> => {
    await apiClient.delete(`/settings/locations/${id}`, {
      'x-rfid': adminRfid.toString()
    });
  },

  // Sectors
  getSectors: async (): Promise<Sector[]> => {
    return await apiClient.get<Sector[]>('/settings/sectors');
  },
  createSector: async (name: string, adminRfid: number): Promise<Sector> => {
    return await apiClient.post<Sector>('/settings/sectors', { name, adminRfid });
  },
  updateSector: async (id: string, name: string, adminRfid: number): Promise<Sector> => {
    return await apiClient.patch<Sector>(`/settings/sectors/${id}`, { name, adminRfid });
  },
  deleteSector: async (id: string, adminRfid: number): Promise<void> => {
    await apiClient.delete(`/settings/sectors/${id}`, {
      'x-rfid': adminRfid.toString()
    });
  },
};
