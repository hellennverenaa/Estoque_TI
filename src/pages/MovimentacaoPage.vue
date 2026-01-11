<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { 
  Save, Calendar, CheckCircle2, ScanBarcode, Lock, Scan, X, 
  CheckCircle, ArrowRight, MapPin 
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Textarea from '../components/Textarea.vue';
import Button from '../components/Button.vue';
import Badge from '../components/Badge.vue';
import { useMaterialStore } from '../stores/materialStore';
import { useMovimentacaoStore } from '../stores/movimentacaoStore';
import { useAuthStore } from '../stores/authStore';
import { LOCAIS } from '../constants/lists'; // <--- IMPORTAÇÃO NOVA

const materialStore = useMaterialStore();
const movimentacaoStore = useMovimentacaoStore();
const authStore = useAuthStore();

// --- Controles ---
const showAuthModal = ref(false);
const showSuccessModal = ref(false);
const authInput = ref('');
const authInputRef = ref<HTMLInputElement | null>(null);

const buscaIdentificacao = ref('');
const materialEncontradoInfo = ref<string | null>(null);

const formData = ref({
  tipo: 'entrada',
  materialCodigo: '',
  quantidade: '',
  responsavel: '',
  observacoes: '',
  data: new Date().toISOString().split('T')[0],
  local: '' 
});

const tipoOptions = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
];

watch(buscaIdentificacao, (novoValor) => {
  materialEncontradoInfo.value = null; 
  if (!novoValor || String(novoValor).trim() === '') return;
  const termoBusca = String(novoValor).trim().toLowerCase();
  
  const encontrado = materialStore.materials?.find(m => {
    const cod = String(m.codigo).trim().toLowerCase();
    const pat = String(m.patrimonio || '').trim().toLowerCase();
    const ns = String(m.numeroSerie || '').trim().toLowerCase();
    return cod === termoBusca || pat === termoBusca || ns === termoBusca;
  });

  if (encontrado) {
    formData.value.materialCodigo = String(encontrado.codigo);
    materialEncontradoInfo.value = encontrado.nome;
    toast.success(`Item identificado: ${encontrado.nome}`);
  }
});

const materialSelecionado = computed(() => {
  return materialStore.materials?.find(m => String(m.codigo) === String(formData.value.materialCodigo));
});

// LÓGICA INTELIGENTE DE LOCAL:
watch(materialSelecionado, (novoMaterial) => {
  if (novoMaterial) {
    const localAtual = novoMaterial.local || '';
    // Verifica se o local atual é um dos locais padrões (simples) definidos no arquivo de listas
    const isLocalSimples = LOCAIS.some(l => l.value === localAtual);
    
    // Se for simples, preenche. Se for composto (múltiplos), deixa vazio para forçar escolha.
    formData.value.local = isLocalSimples ? localAtual : '';
  }
});

const abrirModalAuth = () => {
  if (!materialSelecionado.value) { toast.error('Selecione um material'); return; }
  if (!formData.value.quantidade) { toast.error('Informe a quantidade'); return; }
  if (!formData.value.local && formData.value.tipo === 'entrada') { toast.error('Informe o local de destino'); return; }
  
  showAuthModal.value = true;
  authInput.value = '';
  nextTick(() => authInputRef.value?.focus());
};

const confirmarAuth = () => {
  const usuario = authStore.validarCracha(authInput.value);
  if (usuario) {
    formData.value.responsavel = usuario.nome;
    showAuthModal.value = false;
    processarMovimentacao();
  } else {
    toast.error('Crachá inválido');
    authInput.value = '';
    authInputRef.value?.focus();
  }
};

const processarMovimentacao = () => {
  const quantidade = Math.abs(parseInt(formData.value.quantidade));
  const material = materialSelecionado.value!;
  
  const novaQuantidade = formData.value.tipo === 'entrada' 
    ? material.quantidade + quantidade
    : material.quantidade - quantidade;

  let novoLocalString = material.local || '';
  const localDestino = formData.value.local;

  if (formData.value.tipo === 'entrada') {
    if (novoLocalString && !novoLocalString.includes(localDestino)) {
      novoLocalString = `${novoLocalString} + ${localDestino}`;
    } else if (!novoLocalString) {
      novoLocalString = localDestino;
    }
  }
  
  if (novaQuantidade <= 0) {
    novoLocalString = '';
  }

  materialStore.updateMaterial(formData.value.materialCodigo, {
    quantidade: novaQuantidade,
    local: novoLocalString 
  });

  movimentacaoStore.addMovimentacao({
    tipo: formData.value.tipo as 'entrada' | 'saida',
    materialCodigo: formData.value.materialCodigo,
    materialNome: material.nome,
    quantidade: quantidade,
    responsavel: formData.value.responsavel,
    observacoes: formData.value.observacoes,
    data: formData.value.data,
    valor: material.valor ? material.valor * quantidade : undefined,
    categoria: material.categoria
  });

  showSuccessModal.value = true;

  buscaIdentificacao.value = '';
  materialEncontradoInfo.value = null;
  formData.value = {
    tipo: 'entrada',
    materialCodigo: '',
    quantidade: '',
    responsavel: '',
    observacoes: '',
    data: new Date().toISOString().split('T')[0],
    local: ''
  };
};

const formatarData = (d: string) => d.split('-').reverse().join('/');
const historicoFiltrado = computed(() => movimentacaoStore.movimentacoes || []); 
const materialOptions = computed(() => materialStore.materials.map(m => ({ value: m.codigo, label: m.nome })));
</script>

<template>
  <div class="flex flex-col gap-10 relative">

    <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Lock class="text-blue-600" /> Autorizar
          </h2>
          <button @click="showAuthModal = false"><X :size="24" class="text-gray-400" /></button>
        </div>
        <div class="flex flex-col items-center py-4">
          <Scan :size="48" class="text-blue-600 mb-4 animate-pulse" />
          <p class="text-gray-600 mb-4">Bipe o crachá para confirmar</p>
          <input ref="authInputRef" v-model="authInput" @keyup.enter="confirmarAuth" type="password" class="w-full text-center border-2 border-gray-200 rounded-lg py-3 px-4 text-lg" placeholder="Leia o código..." autocomplete="off" />
        </div>
      </div>
    </div>

    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border-t-8 border-green-500">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle :size="40" class="text-green-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Registrado!</h2>
        <p class="text-gray-500 mb-8">Movimentação concluída.</p>
        <button @click="showSuccessModal = false" class="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2">
          <span>Continuar</span> <ArrowRight :size="18" />
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent text-2xl font-bold">Movimentação de Estoque</h1>
      <p class="text-[#6B7280]">Registre entradas e saídas</p>
    </div>

    <form @submit.prevent="abrirModalAuth">
      <div class="flex flex-col gap-8">
        <Card>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-1.5 h-7 bg-gradient-to-b from-[#2563EB] to-[#1E40AF] rounded-full"></div>
            <h3 class="font-semibold text-[#111827]">Nova Movimentação</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select v-model="formData.tipo" label="Tipo *" :options="tipoOptions" required />
            
            <div class="flex flex-col gap-2">
              <label class="block text-sm font-medium text-gray-700">Busca Rápida</label>
              <div class="relative">
                <Input v-model="buscaIdentificacao" placeholder="Bipe o código..." class="pl-10" />
                <ScanBarcode :size="18" class="absolute left-3 top-3 text-gray-400" />
              </div>
              <div v-if="materialEncontradoInfo" class="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
                <CheckCircle2 :size="14" class="inline mr-1"/> Encontrado: <strong>{{ materialEncontradoInfo }}</strong>
              </div>
            </div>

            <Select v-model="formData.materialCodigo" label="Material *" :options="materialOptions" required />
            <Input v-model="formData.quantidade" label="Quantidade *" type="number" required />
            
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700 ml-1">Local / Destino *</label>
                <span v-if="formData.tipo === 'entrada'" class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Adicionar Local</span>
              </div>
              <div class="relative">
                <Select v-model="formData.local" :options="LOCAIS" required placeholder="Onde será guardado?" />
                <div v-if="materialSelecionado && materialSelecionado.local && !materialSelecionado.local.includes(formData.local) && formData.local" class="absolute -bottom-5 right-0 text-xs text-blue-600 flex items-center gap-1 font-medium">
                   <MapPin :size="12"/> Será adicionado aos locais existentes
                </div>
              </div>
            </div>

            <Input v-model="formData.data" label="Data *" type="date" required />
            
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Responsável</label>
              <input type="text" value="Será preenchido pelo crachá" disabled class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 italic text-sm" />
            </div>

            <div class="md:col-span-2">
              <Textarea v-model="formData.observacoes" label="Observações" :rows="3" />
            </div>
          </div>
        </Card>

        <Card v-if="materialSelecionado" class="bg-blue-50 border border-blue-100">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
             <div class="flex items-center gap-4">
               <div class="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                  <MapPin :size="24" class="text-blue-600"/>
               </div>
               <div>
                 <p class="text-xs text-blue-600 font-bold uppercase tracking-wider">Locais Onde Existe</p>
                 <p class="text-gray-900 font-medium text-lg leading-tight">{{ materialSelecionado.local || 'Sem local definido' }}</p>
               </div>
             </div>
             <div class="sm:ml-auto sm:text-right border-t sm:border-t-0 border-blue-200 pt-2 sm:pt-0">
               <p class="text-xs text-gray-500 uppercase tracking-wider">Saldo Total</p>
               <p class="text-2xl font-bold text-gray-900">{{ materialSelecionado.quantidade }}</p>
             </div>
          </div>
        </Card>

        <Card class="bg-gray-50 border-dashed border-2">
          <div class="flex justify-end">
            <Button type="submit"><Lock :size="16" class="mr-2" /> Validar e Registrar</Button>
          </div>
        </Card>
      </div>
    </form>
    
    <Card>
      <div class="flex items-center gap-3 mb-6">
        <Calendar :size="24" class="text-green-600" />
        <h3 class="font-semibold text-gray-800">Histórico Recente</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resp.</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="mov in historicoFiltrado" :key="mov.id">
              <td class="px-6 py-4 text-sm">{{ formatarData(mov.data) }}</td>
              <td class="px-6 py-4"><Badge :variant="mov.tipo === 'entrada' ? 'success' : 'error'">{{ mov.tipo.toUpperCase() }}</Badge></td>
              <td class="px-6 py-4 text-sm">{{ mov.materialNome }}</td>
              <td class="px-6 py-4 text-sm">{{ mov.responsavel }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>