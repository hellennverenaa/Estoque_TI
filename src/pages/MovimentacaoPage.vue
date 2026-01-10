<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Save, Calendar, CheckCircle2, ScanBarcode } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Textarea from '../components/Textarea.vue';
import Button from '../components/Button.vue';
import Badge from '../components/Badge.vue';
import { useMaterialStore } from '../stores/materialStore';
import { useMovimentacaoStore } from '../stores/movimentacaoStore';

const materialStore = useMaterialStore();
const movimentacaoStore = useMovimentacaoStore();

const formatarData = (dataString: string) => {
  if (!dataString) return '-';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
};

const buscaIdentificacao = ref('');
const materialEncontradoInfo = ref<string | null>(null);

const formData = ref({
  tipo: 'entrada',
  materialCodigo: '',
  quantidade: '',
  responsavel: '',
  observacoes: '',
  data: new Date().toISOString().split('T')[0],
});

// --- LÓGICA DE BUSCA GLOBAL (CÓDIGO, SÉRIE OU PATRIMÔNIO) ---
watch(buscaIdentificacao, (novoValor) => {
  materialEncontradoInfo.value = null; // Reseta aviso

  if (!novoValor || String(novoValor).trim() === '') return;
  
  const termoBusca = String(novoValor).trim().toLowerCase();

  // Busca em TUDO: Código do sistema, Patrimônio ou Número de Série
  const encontrado = materialStore.materials?.find(m => {
    const codigoSistema = String(m.codigo).trim().toLowerCase();
    const patrimonio = String(m.patrimonio || '').trim().toLowerCase();
    const numeroSerie = String(m.numeroSerie || '').trim().toLowerCase();
    
    // Se bater com QUALQUER um dos três, encontra o material
    return codigoSistema === termoBusca || patrimonio === termoBusca || numeroSerie === termoBusca;
  });

  if (encontrado) {
    // 1. Seleciona o material no dropdown
    formData.value.materialCodigo = String(encontrado.codigo);
    
    // 2. Define qual tipo de dado foi usado para achar (para feedback visual)
    let tipoEncontrado = 'Código';
    if (String(encontrado.patrimonio || '').toLowerCase() === termoBusca) tipoEncontrado = 'Patrimônio';
    if (String(encontrado.numeroSerie || '').toLowerCase() === termoBusca) tipoEncontrado = 'Nº Série';
    
    materialEncontradoInfo.value = `${encontrado.nome} (via ${tipoEncontrado})`;
    
    toast.success(`Item identificado: ${encontrado.nome}`);
  }
});

// Limpeza automática se o usuário mudar o material manualmente no dropdown
watch(() => formData.value.materialCodigo, (novoCodigo) => {
  if (!novoCodigo) return;
  
  const mat = materialStore.materials.find(m => String(m.codigo) === String(novoCodigo));
  if (mat) {
    // Verifica se o material selecionado tem alguma relação com o que está digitado na busca
    const termo = String(buscaIdentificacao.value).trim().toLowerCase();
    const matchCod = String(mat.codigo).toLowerCase() === termo;
    const matchPat = String(mat.patrimonio || '').toLowerCase() === termo;
    const matchNS = String(mat.numeroSerie || '').toLowerCase() === termo;

    // Se o termo digitado não bater com nada do material selecionado, limpa o aviso verde
    if (termo && !matchCod && !matchPat && !matchNS) {
       materialEncontradoInfo.value = null;
    }
  }
});

const filters = ref({
  dataInicio: '',
  dataFim: '',
  tipo: 'todos',
  busca: ''
});

const tipoOptions = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
];

const materialOptions = computed(() => {
  const lista = materialStore.materials || [];
  return [
    { value: '', label: 'Selecione um material...' },
    ...lista.map(m => ({ 
      value: String(m.codigo), 
      label: `${m.nome} (Cod: ${m.codigo})` 
    }))
  ];
});

const materialSelecionado = computed(() => {
  const lista = materialStore.materials || [];
  return lista.find(m => String(m.codigo) === String(formData.value.materialCodigo));
});

const handleSubmit = () => {
  if (!materialSelecionado.value) {
    toast.error('Selecione um material válido');
    return;
  }

  const quantidade = Math.abs(parseInt(formData.value.quantidade));
  
  if (!quantidade || quantidade <= 0) {
    toast.error('A quantidade deve ser maior que zero');
    return;
  }

  if (formData.value.tipo === 'saida' && quantidade > materialSelecionado.value.quantidade) {
    toast.error('Quantidade de saída maior que o estoque disponível!');
    return;
  }

  movimentacaoStore.addMovimentacao({
    tipo: formData.value.tipo as 'entrada' | 'saida',
    materialCodigo: formData.value.materialCodigo,
    materialNome: materialSelecionado.value.nome,
    quantidade: quantidade,
    responsavel: formData.value.responsavel,
    observacoes: formData.value.observacoes,
    data: formData.value.data,
    valor: materialSelecionado.value.valor ? materialSelecionado.value.valor * quantidade : undefined,
    categoria: materialSelecionado.value.categoria
  });

  const novaQuantidade = formData.value.tipo === 'entrada' 
    ? materialSelecionado.value.quantidade + quantidade
    : materialSelecionado.value.quantidade - quantidade;

  materialStore.updateMaterial(formData.value.materialCodigo, {
    quantidade: novaQuantidade
  });

  toast.success('Movimentação salva com sucesso!');

  // Reset do formulário
  buscaIdentificacao.value = '';
  materialEncontradoInfo.value = null;
  formData.value = {
    tipo: 'entrada',
    materialCodigo: '',
    quantidade: '',
    responsavel: '',
    observacoes: '',
    data: new Date().toISOString().split('T')[0],
  };
};

const historicoFiltrado = computed(() => {
  let resultado = movimentacaoStore.movimentacoes || [];

  if (filters.value.busca) {
    const busca = filters.value.busca.toLowerCase();
    resultado = resultado.filter(m => 
      m.materialNome.toLowerCase().includes(busca) ||
      m.materialCodigo.toLowerCase().includes(busca) ||
      m.responsavel.toLowerCase().includes(busca)
    );
  }

  if (filters.value.tipo !== 'todos') {
    resultado = resultado.filter(m => m.tipo === filters.value.tipo);
  }

  if (filters.value.dataInicio) {
    resultado = resultado.filter(m => m.data >= filters.value.dataInicio);
  }
  if (filters.value.dataFim) {
    resultado = resultado.filter(m => m.data <= filters.value.dataFim);
  }

  return resultado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
});

const limparFiltros = () => {
  filters.value = {
    dataInicio: '',
    dataFim: '',
    tipo: 'todos',
    busca: ''
  };
};
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="space-y-3">
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent text-2xl font-bold">
        Movimentação de Estoque
      </h1>
      <p class="text-[#6B7280]">Registre entradas e saídas de materiais</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-8">
        <Card>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-1.5 h-7 bg-gradient-to-b from-[#2563EB] to-[#1E40AF] rounded-full"></div>
            <h3 class="font-semibold text-[#111827]">Nova Movimentação</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              v-model="formData.tipo"
              label="Tipo de Movimentação *"
              :options="tipoOptions"
              required
            />

            <div class="flex flex-col gap-2">
              <label class="block text-sm font-medium text-gray-700">
                Identificação (Código, Nº Série ou Patrimônio)
              </label>
              <div class="relative">
                <Input
                  v-model="buscaIdentificacao"
                  placeholder="Escaneie ou digite o código..."
                  class="pl-10"
                />
                <ScanBarcode :size="18" class="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div v-if="materialEncontradoInfo" class="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md border border-green-100 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 :size="16" class="text-green-600" />
                <span>Encontrado: <strong>{{ materialEncontradoInfo }}</strong></span>
              </div>
            </div>

            <Select
              v-model="formData.materialCodigo"
              label="Material *"
              :options="materialOptions"
              required
            />

            <Input
              v-model="formData.quantidade"
              label="Quantidade *"
              type="number"
              placeholder="0"
              min="1"
              required
            />

            <Input
              v-model="formData.data"
              label="Data *"
              type="date"
              required
            />

            <Input
              v-model="formData.responsavel"
              label="Responsável *"
              placeholder="Nome do responsável"
              required
            />

            <div v-if="materialSelecionado" class="md:col-span-2 p-4 bg-[#EFF6FF] rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p class="text-sm text-[#6B7280] mb-1">Material Selecionado</p>
                  <p class="font-semibold text-[#111827] text-lg">{{ materialSelecionado.nome }}</p>
                  <div class="flex flex-wrap gap-2 mt-2 text-sm text-[#6B7280]">
                    <span class="bg-white px-2 py-1 rounded border border-blue-100 text-xs font-medium text-blue-800">
                      Cod: {{ materialSelecionado.codigo }}
                    </span>
                    <span v-if="materialSelecionado.numeroSerie" class="bg-white px-2 py-1 rounded border border-blue-100 text-xs font-medium text-blue-800">
                      NS: {{ materialSelecionado.numeroSerie }}
                    </span>
                    <span v-if="materialSelecionado.patrimonio" class="bg-white px-2 py-1 rounded border border-blue-100 text-xs font-medium text-blue-800">
                      Pat: {{ materialSelecionado.patrimonio }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="text-xs text-gray-500 uppercase font-semibold">Estoque Atual</p>
                    <p class="text-2xl font-bold text-blue-600">{{ materialSelecionado.quantidade }}</p>
                  </div>
                  <Badge :variant="materialSelecionado.quantidade < materialSelecionado.minimo ? 'warning' : 'success'">
                    {{ materialSelecionado.quantidade < materialSelecionado.minimo ? 'BAIXO' : 'OK' }}
                  </Badge>
                </div>
              </div>
            </div>

            <div class="md:col-span-2">
              <Textarea
                v-model="formData.observacoes"
                label="Observações"
                placeholder="Informações adicionais..."
                :rows="3"
              />
            </div>
          </div>
        </Card>

        <Card class="bg-gray-50 border-dashed border-2">
          <div class="flex justify-end">
            <Button type="submit">
              <Save :size="16" />
              Registrar Movimentação
            </Button>
          </div>
        </Card>
      </div>
    </form>

    <Card>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
          <Calendar :size="24" class="text-[#10B981]" />
        </div>
        <div>
          <h3 class="font-semibold text-[#111827]">Histórico</h3>
          <p class="text-sm text-[#6B7280]">{{ historicoFiltrado.length }} registros</p>
        </div>
      </div>

      <div class="mb-6 p-4 bg-[#F8F9FA] rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <Input v-model="filters.busca" placeholder="Buscar..." />
          <Input v-model="filters.dataInicio" type="date" label="De" />
          <Input v-model="filters.dataFim" type="date" label="Até" />
          <Select
            v-model="filters.tipo"
            label="Tipo"
            :options="[{ value: 'todos', label: 'Todos' }, ...tipoOptions]"
          />
        </div>
        <Button variant="ghost" size="sm" @click="limparFiltros">Limpar Filtros</Button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resp.</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="mov in historicoFiltrado" :key="mov.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatarData(mov.data) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="mov.tipo === 'entrada' ? 'success' : 'error'">
                  {{ mov.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
                </Badge>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ mov.materialNome }}</div>
                <div class="text-sm text-gray-500">
                   <span v-if="mov.tipo === 'saida'">{{ mov.responsavel }}</span>
                   <span v-else>{{ mov.materialCodigo }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'" class="font-bold">
                  {{ mov.tipo === 'entrada' ? '+' : '-' }}{{ mov.quantidade }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ mov.responsavel }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="historicoFiltrado.length === 0" class="text-center py-8 text-gray-500">
          Nenhum registro encontrado.
        </div>
      </div>
    </Card>
  </div>
</template>