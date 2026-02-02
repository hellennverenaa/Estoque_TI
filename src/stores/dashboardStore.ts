import { ref } from 'vue';
import { dashboardApi } from '../services/dashBoardApi';
import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);
  const productDashData = ref();
  const movimentationDashData = ref();
  const dashData = ref()

  const fetchProductData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const responseProduct = await dashboardApi.products();
      const responseMovimentation = await dashboardApi.movimentations();
      productDashData.value = responseProduct
      movimentationDashData.value = responseMovimentation

      const data = {
        product: responseProduct?.data,
        movimentation: responseMovimentation?.data
      };
      dashData.value = data;
      // console.log(data);
      
      
      return data;
    } catch (error: any) {
      error.value = error?.message || 'Erro ao buscar dados do dashboard (produtos)'
      throw error;
    }
    finally {
      loading.value = false;
    }
  }

  const ensureLoaded = async () => {
    if (initialized.value) return
    await fetchProductData();
  }

  return {
    fetchProductData,
    ensureLoaded,
    productDashData,
    movimentationDashData,
    dashData
  }
})