<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowUpRight, ArrowDownRight, Save, Filter, Calendar } from 'lucide-vue-next';
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

const formData = ref({
  tipo: 'entrada',
  materialCodigo: '',
  quantidade: '',
  responsavel: '',
  observacoes: '',
  data: new Date().toISOString().split('T')[0],
});

// Filtros para histórico
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

const materialOptions = computed(() => [
  { value: '', label: 'Selecione um material...' },
  ...materialStore.materials.map(m => ({ 
    value: m.codigo, 
    label: `${m.nome} (${m.codigo}) - Estoque: ${m.quantidade}` 
  }))
]);

const materialSelecionado = computed(() => 
  materialStore.materials.find(m => m.codigo === formData.value.materialCodigo)
);

const handleSubmit = () => {
  if (!materialSelecionado.value) {
    toast.error('Selecione um material válido');
    return;
  }

  const quantidade = parseInt(formData.value.quantidade);
  
  // Validar quantidade para saída
  if (formData.value.tipo === 'saida' && quantidade > materialSelecionado.value.quantidade) {
    toast.error('Quantidade de saída maior que o estoque disponível!');
    return;
  }

  // Adicionar movimentação
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

  // Atualizar estoque
  const novaQuantidade = formData.value.tipo === 'entrada' 
    ? materialSelecionado.value.quantidade + quantidade
    : materialSelecionado.value.quantidade - quantidade;

  materialStore.updateMaterial(formData.value.materialCodigo, {
    quantidade: novaQuantidade
  });

  toast.success('Movimentação registrada com sucesso!', {
    description: `${formData.value.tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${quantidade} unidade(s)`
  });

  // Resetar formulário
  formData.value = {
    tipo: 'entrada',
    materialCodigo: '',
    quantidade: '',
    responsavel: '',
    observacoes: '',
    data: new Date().toISOString().split('T')[0],
  };
};

// Histórico filtrado
const historicoFiltrado = computed(() => {
  let resultado = movimentacaoStore.movimentacoes;

  // Filtro por busca
  if (filters.value.busca) {
    const busca = filters.value.busca.toLowerCase();
    resultado = resultado.filter(m => 
      m.materialNome.toLowerCase().includes(busca) ||
      m.materialCodigo.toLowerCase().includes(busca) ||
      m.responsavel.toLowerCase().includes(busca)
    );
  }

  // Filtro por tipo
  if (filters.value.tipo !== 'todos') {
    resultado = resultado.filter(m => m.tipo === filters.value.tipo);
  }

  // Filtro por data
  if (filters.value.dataInicio) {
    resultado = resultado.filter(m => m.data >= filters.value.dataInicio);
  }
  if (filters.value.dataFim) {
    resultado = resultado.filter(m => m.data <= filters.value.dataFim);
  }

  // Ordenar por data (mais recente primeiro)
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
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent">
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

            <Input
              v-model="formData.materialCodigo"
              label="Código do Patrimônio"
              placeholder="Ex: PAT-2024-001"
            />

            <Select
              v-model="formData.materialCodigo"
              label="Material"
              :options="materialOptions"
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

            <div v-if="materialSelecionado" class="md:col-span-2 p-4 bg-[#EFF6FF] rounded-xl">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-[#6B7280] mb-1">Material Selecionado</p>
                  <p class="font-semibold text-[#111827]">{{ materialSelecionado.nome }}</p>
                  <p class="text-sm text-[#6B7280]">Estoque atual: {{ materialSelecionado.quantidade }} unidades</p>
                </div>
                <Badge :variant="materialSelecionado.quantidade < materialSelecionado.minimo ? 'warning' : 'success'">
                  {{ materialSelecionado.quantidade < materialSelecionado.minimo ? 'BAIXO' : 'OK' }}
                </Badge>
              </div>
            </div>

            <div class="md:col-span-2">
              <Textarea
                v-model="formData.observacoes"
                label="Observações"
                placeholder="Informações adicionais sobre a movimentação"
                :rows="3"
              />
            </div>
          </div>
        </Card>

        <Card class="bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6] border-2 border-dashed border-[#E5E7EB]">
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
          <h3 class="font-semibold text-[#111827]">Histórico de Movimentações</h3>
          <p class="text-sm text-[#6B7280]">{{ historicoFiltrado.length }} movimentações encontradas</p>
        </div>
      </div>

      <div class="mb-6 p-4 bg-[#F8F9FA] rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <Input
            v-model="filters.busca"
            placeholder="Buscar por material ou responsável..."
          />

          <Input
            v-model="filters.dataInicio"
            type="date"
            label="Data Início"
          />

          <Input
            v-model="filters.dataFim"
            type="date"
            label="Data Fim"
          />

          <Select
            v-model="filters.tipo"
            label="Tipo"
            :options="[
              { value: 'todos', label: 'Todos' },
              { value: 'entrada', label: 'Entrada' },
              { value: 'saida', label: 'Saída' }
            ]"
          />
        </div>
        <Button variant="ghost" size="sm" @click="limparFiltros">
          Limpar Filtros
        </Button>
      </div>

      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[#F8F9FA] border-b border-[#E5E7EB]">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Data</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Material</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Código</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Qtd</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Responsável</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Valor</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-[#F1F3F5]">
            <tr
              v-for="mov in historicoFiltrado"
              :key="mov.id"
              class="hover:bg-[#F8F9FA] transition-colors"
            >
              <td class="px-6 py-4 text-[#6B7280]">
                {{ new Date(mov.data).toLocaleDateString('pt-BR') }}
              </td>
              <td class="px-6 py-4">
                <Badge :variant="mov.tipo === 'entrada' ? 'success' : 'error'">
                  {{ mov.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
                </Badge>
              </td>
              <td class="px-6 py-4 font-medium text-[#111827]">{{ mov.materialNome }}</td>
              <td class="px-6 py-4 text-[#6B7280] font-mono text-sm">{{ mov.materialCodigo }}</td>
              <td class="px-6 py-4">
                <span 
                  class="font-bold"
                  :class="mov.tipo === 'entrada' ? 'text-[#10B981]' : 'text-[#EF4444]'"
                >
                  {{ mov.tipo === 'entrada' ? '+' : '-' }}{{ mov.quantidade }}
                </span>
              </td>
              <td class="px-6 py-4 text-[#6B7280]">{{ mov.responsavel }}</td>
              <td class="px-6 py-4 text-[#6B7280]">
                {{ mov.valor ? `R$ ${mov.valor.toFixed(2)}` : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="lg:hidden space-y-4">
        <Card
          v-for="mov in historicoFiltrado"
          :key="mov.id"
          size="small"
        >
          <div class="flex items-start gap-4 mb-4">
            <div 
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="mov.tipo === 'entrada' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FEF2F2] text-[#EF4444]'"
            >
              <component :is="mov.tipo === 'entrada' ? ArrowUpRight : ArrowDownRight" :size="24" />
            </div>
            <div class="flex-1">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-semibold text-[#111827]">{{ mov.materialNome }}</p>
                  <p class="text-sm text-[#6B7280]">{{ mov.materialCodigo }}</p>
                </div>
                <Badge :variant="mov.tipo === 'entrada' ? 'success' : 'error'">
                  {{ mov.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
                </Badge>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-[#9CA3AF]">Data:</span>
              <span class="ml-2 text-[#111827]">{{ new Date(mov.data).toLocaleDateString('pt-BR') }}</span>
            </div>
            <div>
              <span class="text-[#9CA3AF]">Qtd:</span>
              <span 
                class="ml-2 font-bold"
                :class="mov.tipo === 'entrada' ? 'text-[#10B981]' : 'text-[#EF4444]'"
              >
                {{ mov.tipo === 'entrada' ? '+' : '-' }}{{ mov.quantidade }}
              </span>
            </div>
            <div class="col-span-2">
              <span class="text-[#9CA3AF]">Responsável:</span>
              <span class="ml-2 text-[#111827]">{{ mov.responsavel }}</span>
            </div>
          </div>
        </Card>
      </div>

      <div v-if="historicoFiltrado.length === 0" class="text-center py-12">
        <p class="text-[#9CA3AF]">Nenhuma movimentação encontrada</p>
      </div>
    </Card>
  </div>
</template>