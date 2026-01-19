import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProductListFilters } from '../services/productsApi';
import { productsApi, type ApiProduct, type CreateProductPayload, type UpdateProductPayload } from '../services/productsApi';

export interface Material {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
  minimo: number;
  valor?: number | string;
  patrimonio?: string;
  numeroSerie?: string;
  local?: string;
  criadoPor?: string;
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
      codigo,
      nome: p.name,
      categoria: p.category,
      quantidade: p.quantity,
      minimo: p.minimal_quantity,
      valor: p.value ?? undefined,
      numeroSerie: p.serial_number ?? undefined,
      local: p.local_storage ?? undefined,
      patrimonio: isPatrimonio ? codigo : undefined
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

  type MaterialCreateInput = Omit<Material, 'id'>;

  const createMaterial = async (material: MaterialCreateInput) => {
    const payload: CreateProductPayload = {
      name: material.nome,
      category: material.categoria,
      codigo: material.codigo,
      serial_number: material.numeroSerie,
      minimal_quantity: material.minimo,
      quantity: material.quantidade,
      value: material.valor,
      local_storage: material.local
    };

    const created = await productsApi.create(payload);
    materials.value.push(fromApiProduct(created));
    return created;
  };

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    const payload: UpdateProductPayload = {
      name: updates.nome,
      category: updates.categoria,
      codigo: updates.codigo,
      serial_number: updates.numeroSerie,
      minimal_quantity: updates.minimo,
      quantity: updates.quantidade,
      value: updates.valor,
      local_storage: updates.local
    };

    const updated = await productsApi.update(id, payload);
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