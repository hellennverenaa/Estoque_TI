import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  materialCodigo: string;
  materialNome: string;
  quantidade: number;
  responsavel: string;
  observacoes: string;
  data: string;
  valor?: number;
  categoria?: string;
}

export const useMovimentacaoStore = defineStore('movimentacao', () => {
  // --- LÓGICA DE CARREGAMENTO SEGURA ---
  const loadFromStorage = (): Movimentacao[] => {
    try {
      const saved = localStorage.getItem('estoque_movimentacoes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Erro ao carregar movimentações:', e);
    }
    return [];
  };

  const movimentacoes = ref<Movimentacao[]>(loadFromStorage());

  watch(movimentacoes, (newVal) => {
    localStorage.setItem('estoque_movimentacoes', JSON.stringify(newVal));
  }, { deep: true });
  // -------------------------------------

  const addMovimentacao = (mov: Omit<Movimentacao, 'id'>) => {
    const novaMovimentacao = {
      ...mov,
      id: crypto.randomUUID()
    };
    movimentacoes.value.push(novaMovimentacao);
  };

  return {
    movimentacoes,
    addMovimentacao
  };
});