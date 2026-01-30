import { defineStore } from 'pinia';
import { ref } from 'vue';
import { movimentationsApi, type ApiMovimentation, type ApiMovimentationType, type CreateMovimentationPayload } from '../services/movimentationsApi';
import { useMaterialStore } from './materialStore';

export interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida' | 'transferencia' | 'ajuste';
  materialId: string;
  materialCodigo: string;
  materialNome: string;
  quantidade: number;
  responsavelId: number;
  responsavel?: string;
  observacoes: string;
  data: string;
  valor?: number;
  categoria?: string;
}

export const useMovimentacaoStore = defineStore('movimentacao', () => {
  const materialStore = useMaterialStore();
  const movimentacoes = ref<Movimentacao[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const mapApiTypeToUi = (type: ApiMovimentationType): Movimentacao['tipo'] => {
    if (type === 'outbound') return 'saida';
    if (type === 'transfer') return 'transferencia';
    if (type === 'adjustment') return 'ajuste';
    return 'entrada';
  };

  const mapUiTypeToApi = (type: Movimentacao['tipo']): ApiMovimentationType => {
    if (type === 'saida') return 'outbound';
    if (type === 'transferencia') return 'transfer';
    if (type === 'ajuste') return 'adjustment';
    return 'inbound';
  };

  const toDateOnly = (iso: string) => {
    if (!iso) return new Date().toISOString().slice(0, 10);
    return iso.slice(0, 10);
  };

  const fromApi = (m: ApiMovimentation): Movimentacao => {
    const material = materialStore.getById(m.product_id);
    const materialCodigo = material?.codigo || '';
    const materialNome = material?.name || m.product?.name || '';
    const categoria = material?.category || m.product?.category;
    const valorUnit = material?.value || 0;

    return {
      id: m.id,
      tipo: mapApiTypeToUi(m.type),
      materialId: m.product_id,
      materialCodigo,
      materialNome,
      quantidade: m.quantity,
      responsavelId: m.movimented_by,
      responsavel: String(m.movimented_by),
      observacoes: m.appointment || '',
      data: toDateOnly(m.created_at),
      valor: valorUnit ? Number(valorUnit) * m.quantity : undefined,
      categoria
    };
  };

  const fetchMovimentacoes = async () => {
    loading.value = true;
    error.value = null;

    try {
      await materialStore.ensureLoaded();
      const response = await movimentationsApi.list();
      movimentacoes.value = response.data.map(fromApi);
      initialized.value = true;
    } catch (e: any) {
      error.value = e?.message || 'Erro ao buscar movimentações';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (initialized.value) return;
    await fetchMovimentacoes();
  };

  type CreateMovimentacaoInput = {
    tipo: Movimentacao['tipo'];
    productId: string;
    quantity: number;
    responsibleUserId: number;
    newLocation?: string;
    notes?: string;
  };

  const createMovimentacao = async (input: CreateMovimentacaoInput) => {
    const payload: CreateMovimentationPayload = {
      type: mapUiTypeToApi(input.tipo),
      product_id: input.productId,
      movimented_by: input.responsibleUserId,
      quantity: input.quantity,
      new_location: input.newLocation,
      notes: input.notes
    };

    const created = await movimentationsApi.create(payload);
    movimentacoes.value.push(fromApi(created.data));
    return created.data;
  };

  return {
    movimentacoes,
    loading,
    error,
    fetchMovimentacoes,
    ensureLoaded,
    createMovimentacao
  };
});