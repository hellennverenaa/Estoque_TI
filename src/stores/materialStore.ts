import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface Material {
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
  minimo: number;
  valor?: number;
  patrimonio?: string;
  numeroSerie?: string;
  local?: string;
  criadoPor?: string; // <--- O CAMPO NOVO QUE ESTAVA FALTANDO
}

export const useMaterialStore = defineStore('material', () => {
  const loadFromStorage = (): Material[] => {
    try {
      const saved = localStorage.getItem('estoque_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Erro ao carregar materiais:', e);
    }
    return [];
  };

  const materials = ref<Material[]>(loadFromStorage());

  watch(materials, (newVal) => {
    localStorage.setItem('estoque_materials', JSON.stringify(newVal));
  }, { deep: true });

  const addMaterial = (material: Material) => {
    if (materials.value.some(m => m.codigo === material.codigo)) {
      throw new Error('Material com este código já existe');
    }
    materials.value.push(material);
  };

  const updateMaterial = (codigo: string, updates: Partial<Material>) => {
    const index = materials.value.findIndex(m => m.codigo === codigo);
    if (index !== -1) {
      materials.value[index] = { ...materials.value[index], ...updates };
    }
  };

  const deleteMaterial = (codigo: string) => {
    materials.value = materials.value.filter(m => m.codigo !== codigo);
  };

  return {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial
  };
});