import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { settingsApi, StorageLocation, Sector } from '../services/settingsApi';

export const useSettingsStore = defineStore('settings', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const locations = ref<StorageLocation[]>([]);
  const sectors = ref<Sector[]>([]);

  const fetchSettings = async () => {
    loading.value = true;
    error.value = null;
    try {
      const [locs, secs] = await Promise.all([
        settingsApi.getLocations(),
        settingsApi.getSectors(),
      ]);
      locations.value = locs;
      sectors.value = secs;
    } catch (e: any) {
      error.value = e.message || 'Erro ao carregar configurações.';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (locations.value.length === 0 || sectors.value.length === 0) {
      await fetchSettings();
    }
  };

  const getLocationsOptions = computed(() => {
    return locations.value.map((loc) => ({ value: loc.name, label: loc.name }));
  });

  const getSectorsOptions = computed(() => {
    return sectors.value.map((sec) => ({ value: sec.name, label: sec.name }));
  });

  return {
    locations,
    sectors,
    loading,
    error,
    fetchSettings,
    ensureLoaded,
    getLocationsOptions,
    getSectorsOptions,
  };
});
