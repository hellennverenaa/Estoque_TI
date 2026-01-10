<script setup lang="ts">
import { computed } from 'vue';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingUp,
  TrendingDown 
} from 'lucide-vue-next';
import Card from '../components/Card.vue';
import { useMaterialStore } from '../stores/materialStore';
import { useMovimentacaoStore } from '../stores/movimentacaoStore';

const materialStore = useMaterialStore();
const movimentacaoStore = useMovimentacaoStore();

// --- CORREÇÃO DE DATA ---
// Transforma "2026-01-09" direto em "09/01/2026" sem passar pelo fuso horário
const formatarData = (dataString: string) => {
  if (!dataString) return '-';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
};

// Total de Materiais Cadastrados
const totalMateriais = computed(() => (materialStore.materials || []).length);

// Valor Total em Estoque
const valorTotalEstoque = computed(() => {
  const lista = materialStore.materials || [];
  return lista.reduce((acc, m) => acc + ((m.quantidade || 0) * (m.valor || 0)), 0);
});

// Itens com Estoque Baixo
const itensBaixoEstoque = computed(() => {
  const lista = materialStore.materials || [];
  return lista.filter(m => m.quantidade < m.minimo);
});

// Últimas Movimentações (Pega as 5 últimas)
const ultimasMovimentacoes = computed(() => {
  const lista = movimentacaoStore.movimentacoes || [];
  return [...lista]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);
});

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
        Visão Geral
      </h1>
      <p class="text-gray-500">Resumo do seu estoque em tempo real</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="border-l-4 border-l-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-medium">Total de Materiais</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ totalMateriais }}</h3>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg">
            <Package class="text-blue-600" :size="24" />
          </div>
        </div>
      </Card>

      <Card class="border-l-4 border-l-green-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-medium">Valor em Estoque</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ formatarMoeda(valorTotalEstoque) }}</h3>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <TrendingUp class="text-green-600" :size="24" />
          </div>
        </div>
      </Card>

      <Card class="border-l-4 border-l-red-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-medium">Estoque Crítico</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ itensBaixoEstoque.length }}</h3>
          </div>
          <div class="p-3 bg-red-50 rounded-lg">
            <AlertTriangle class="text-red-600" :size="24" />
          </div>
        </div>
      </Card>

      <Card class="border-l-4 border-l-purple-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-medium">Movimentações</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">
              {{ (movimentacaoStore.movimentacoes || []).length }}
            </h3>
          </div>
          <div class="p-3 bg-purple-50 rounded-lg">
            <ArrowRightLeft class="text-purple-600" :size="24" />
          </div>
        </div>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card class="h-full">
        <div class="flex items-center gap-2 mb-6">
          <AlertTriangle class="text-red-500" :size="20" />
          <h3 class="font-semibold text-gray-800">Alertas de Reposição</h3>
        </div>
        <div v-if="itensBaixoEstoque.length === 0" class="text-center py-8 text-gray-400">
           <p>Tudo certo! Nenhum item em falta.</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in itensBaixoEstoque.slice(0, 5)" :key="item.codigo" 
               class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
            <div>
              <p class="font-medium text-gray-800">{{ item.nome }}</p>
              <p class="text-sm text-gray-500">Cód: {{ item.codigo }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-red-600">{{ item.quantidade }} un</p>
              <p class="text-xs text-red-400">Mín: {{ item.minimo }}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card class="h-full">
        <div class="flex items-center gap-2 mb-6">
          <LayoutDashboard class="text-blue-500" :size="20" />
          <h3 class="font-semibold text-gray-800">Últimas Movimentações</h3>
        </div>

        <div v-if="ultimasMovimentacoes.length === 0" class="text-center py-8 text-gray-400">
          <p>Nenhuma movimentação registrada.</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="mov in ultimasMovimentacoes" :key="mov.id" 
               class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div class="flex items-center gap-3">
              <div :class="mov.tipo === 'entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                   class="p-2 rounded-full">
                <component :is="mov.tipo === 'entrada' ? TrendingUp : TrendingDown" :size="16" />
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ mov.materialNome }}</p>
                <p class="text-xs text-gray-500">{{ formatarData(mov.data) }}</p>
              </div>
            </div>
            <span :class="mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'" class="font-bold">
              {{ mov.tipo === 'entrada' ? '+' : '-' }}{{ mov.quantidade }}
            </span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>