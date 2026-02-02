import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProductListFilters } from '../services/productsApi';
import { productsApi, type ApiProduct, type UpdateProductDTO, type UpdateProductPayload } from '../services/productsApi';

export interface CreateProductDTO {
  name: string;
  category: string;
  codigo?: string;
  serial_number?: string;
  minimal_quantity?: number;
  quantity?: number;
  value?: number;
  local_storage?: string;
  created_by: number | string;
}

export interface Material {
  id: string;
  codigo?: string;
  name: string;
  category: string;
  quantity: number;
  minimal_quantity: number;
  value?: number | string;
  serial_number?: string;
  local_storage?: string;
  created_by: number | string;
  fornecedor?: string;
}

export const useMaterialStore = defineStore('material', () => {
  const materials = ref<Material[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const fromApiProduct = (p: ApiProduct): Material => {
    const codigo = (p.codigo ?? '') || '';
    const isPatrimonio = codigo && !codigo.includes('-');

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      minimal_quantity: p.minimal_quantity,
      value: p.value ?? undefined,
      serial_number: p.serial_number ?? undefined,
      local_storage: p.local_storage ?? undefined,
      codigo: isPatrimonio ? codigo : undefined,
      created_by: p.created_by
    };
  };

  const fetchMaterials = async (filters?: ProductListFilters) => {
    loading.value = true;
    error.value = null;
    try {
      const list = await productsApi.list(filters);
      materials.value = list.data.map(fromApiProduct);
      initialized.value = true;

      // console.log("Materials");
      // console.log(list);
    } catch (e: any) {
      error.value = e?.message || 'Erro ao buscar materiais';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (initialized.value) return;
    await fetchMaterials();
  };

  // type MaterialCreateInput = Omit<Material, 'id'>;

  const createMaterial = async (material: CreateProductDTO, userRfid: number | string) => {
    try {
      const created = await productsApi.create(material, userRfid);
      
      return created;
    } catch (error) {
      throw error;
    }
  };

  const updateMaterial = async (id: string, updates: UpdateProductDTO, userRfid: number) => {
    const sanitized: UpdateProductDTO = {
      name: updates.name,
      category: updates.category,
      codigo: updates.codigo,
      serial_number: updates.serial_number,
      minimal_quantity: updates.minimal_quantity,
      quantity: updates.quantity,
      value: updates.value,
      local_storage: updates.local_storage,
      editReason: updates.editReason,
    };

    // Remove undefined para evitar enviar campos vazios sem querer
    const cleaned = Object.fromEntries(
      Object.entries(sanitized).filter(([_, v]) => v !== undefined)
    ) as UpdateProductDTO;

    const payload: UpdateProductPayload = {
      ...cleaned,
      updated_by: userRfid,
    };

    console.log(payload);
    

    const updated = await productsApi.update(id, payload, userRfid);
    const index = materials.value.findIndex(m => m.id === id);
    if (index !== -1) {
      materials.value[index] = fromApiProduct(updated);
    }
    return updated;
  };

  const deleteMaterial = async (id: string) => {
    await productsApi.remove(id);
    materials.value = materials.value.filter(m => m.id !== id);
  };

  const getById = (id: string) => materials.value.find(m => m.id === id);

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    ensureLoaded,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getById
  };
});