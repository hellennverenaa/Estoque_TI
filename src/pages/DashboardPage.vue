<script setup lang="ts">
import { computed, onMounted } from "vue";
import { LayoutDashboard, Package, AlertTriangle, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-vue-next";
import Card from "../components/Card.vue";
import { useMaterialStore } from "../stores/materialStore";
import { useMovimentacaoStore } from "../stores/movimentacaoStore";
import { useDashboardStore } from "../stores/dashboardStore";

const materialStore = useMaterialStore();
const movimentacaoStore = useMovimentacaoStore();
const dashboardStore = useDashboardStore();

onMounted(() => {
  materialStore.ensureLoaded().catch(() => undefined);
  movimentacaoStore.ensureLoaded().catch(() => undefined);
  dashboardStore.ensureLoaded().catch(() => undefined);
});

// --- CORREÇÃO DE DATA ---
const formatarData = (dataString: string) => {
  if (!dataString) return "-";

  const formatedDate = new Date(dataString).toLocaleDateString('pt-BR')
  return formatedDate;
};

// Total de Materiais Cadastrados
const totalMateriais = computed(() => dashboardStore?.productDashData?.data?.totalMaterials);

// Valor Total em Estoque
const valorTotalEstoque = computed(() => dashboardStore?.productDashData?.data?.totalStockValue);

// Itens com Estoque Baixo
const itensBaixoEstoque = computed(
  () =>
    dashboardStore?.productDashData?.data?.outOfStockProducts ||
    0 + dashboardStore?.productDashData?.data?.lowStockProducts ||
    0,
);

const totalMovimentacoes = computed(() => dashboardStore?.movimentationDashData?.data?.totalMovimentations);

// Últimas Movimentações (Pega as 5 últimas)
const ultimasMovimentacoes = computed(() => dashboardStore?.movimentationDashData?.data?.recentMovimentations);

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
};

// Dados para gráfico de pizza - Top 5 materiais por valor
const dadosGraficoPizza = computed(() => { 
  const lista = materialStore.materials || [];

  return lista
    .map((m) => ({
      nome: m.name,
      valor: (m.quantity || 0) * (parseFloat(m.value as string) || 0),
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
});

// Dados para gráfico de barras - Movimentações
const dadosMovimentacoes = computed(() => {
  const entradas = dashboardStore?.dashData?.movimentation?.movimentationsByType?.inbound;
  const saidas = dashboardStore?.dashData?.movimentation?.movimentationsByType?.outbound

  return { entradas, saidas };
});

// Função para gerar o path do gráfico de pizza
const getSlicePath = (index: number, data: any[]) => {
  const total = data.reduce((acc, item) => acc + item.valor, 0);
  if (total === 0) return "";

  let startAngle = 0;
  for (let i = 0; i < index; i++) {
    startAngle += (data[i].valor / total) * 360;
  }

  const angle = (data[index].valor / total) * 360;
  const endAngle = startAngle + angle;

  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  const largeArc = angle > 180 ? 1 : 0;

  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header Profissional -->
    <div
      class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 shadow-lg border-l-4 border-blue-500 animate-slide-down hover:shadow-2xl transition-all duration-300"
    >
      <h1 class="text-3xl font-bold text-white animate-title">Dashboard</h1>
      <p class="text-slate-300 mt-1 animate-subtitle">Visão geral do estoque e movimentações</p>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        class="bg-slate-800 border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-card"
        style="animation-delay: 0.1s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total de Materiais</p>
            <h3 class="text-3xl font-bold text-white mt-2 animate-number">{{ totalMateriais }}</h3>
          </div>
          <div class="p-3 bg-blue-600 rounded-lg icon-float">
            <Package class="text-white" :size="28" />
          </div>
        </div>
      </Card>

      <Card
        class="bg-slate-800 border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-card"
        style="animation-delay: 0.2s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Valor em Estoque</p>
            <h3 class="text-2xl font-bold text-white mt-2 animate-number">{{ formatarMoeda(valorTotalEstoque) }}</h3>
          </div>
          <div class="p-3 bg-emerald-600 rounded-lg icon-float">
            <TrendingUp class="text-white" :size="28" />
          </div>
        </div>
      </Card>

      <Card
        class="bg-slate-800 border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-card"
        style="animation-delay: 0.3s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estoque Crítico</p>
            <h3 class="text-3xl font-bold text-orange-400 mt-2 animate-number animate-pulse-slow">
              {{ itensBaixoEstoque }}
            </h3>
          </div>
          <div class="p-3 bg-orange-600 rounded-lg icon-float">
            <AlertTriangle class="text-white" :size="28" />
          </div>
        </div>
      </Card>

      <Card
        class="bg-slate-800 border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-card"
        style="animation-delay: 0.4s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Movimentações</p>
            <h3 class="text-3xl font-bold text-white mt-2 animate-number">
              {{ totalMovimentacoes }}
            </h3>
          </div>
          <div class="p-3 bg-indigo-600 rounded-lg icon-float">
            <ArrowRightLeft class="text-white" :size="28" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Gráficos e Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Gráfico de Pizza - Top 5 Materiais por Valor -->
      <Card class="bg-slate-800 border-slate-700 animate-slide-left hover:shadow-2xl transition-shadow duration-300">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div class="w-1 h-6 bg-blue-500 rounded animate-pulse"></div>
          Top 5 Materiais por Valor
        </h3>
        <div class="relative" style="height: 300px">
          <svg viewBox="0 0 200 200" class="w-full h-full">

            <template v-if="dadosGraficoPizza.length > 0">
              <g v-for="(item, index) in dadosGraficoPizza" :key="index">
                <path
                  :d="getSlicePath(index, dadosGraficoPizza)"
                  :fill="['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'][index]"
                  class="transition-all duration-500 hover:opacity-80 cursor-pointer pie-slice"
                  :style="`animation-delay: ${index * 0.15}s; transform-origin: 100px 100px;`"
                />
              </g>
              <circle cx="100" cy="100" r="45" fill="#1e293b" class="animate-pulse-subtle" />
            </template>
            
            <text v-else x="100" y="100" text-anchor="middle" fill="#94a3b8" font-size="12">Sem dados</text>
          </svg>
        </div>
        <div class="mt-4 space-y-2">
          <div
            v-for="(item, index) in dadosGraficoPizza"
            :key="index"
            class="flex items-center justify-between text-sm animate-slide-right hover:bg-slate-700 p-2 rounded transition-all duration-200"
            :style="`animation-delay: ${0.5 + index * 0.1}s`"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full animate-pulse-slow"
                :style="{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'][index] }"
              ></div>
              <span class="text-slate-300">{{ item.nome }}</span>
            </div>
            <span class="text-white font-semibold">{{ formatarMoeda(item.valor) }}</span>
          </div>
        </div>
      </Card>

      <!-- Gráfico de Barras - Entrada vs Saída -->
      <Card class="bg-slate-800 border-slate-700 animate-slide-right hover:shadow-2xl transition-shadow duration-300">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div class="w-1 h-6 bg-emerald-500 rounded animate-pulse"></div>
          Movimentações: Entrada vs Saída
        </h3>
        <div class="space-y-6 pt-4">
          <div class="animate-slide-up" style="animation-delay: 0.2s">
            <div class="flex items-center justify-between mb-2">
              <span class="text-slate-300 font-medium">Entradas</span>
              <span class="text-emerald-400 font-bold text-xl animate-number">{{ dadosMovimentacoes.entradas }}</span>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-8 overflow-hidden">
              <div
                class="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3 bar-fill"
                :style="{
                  width:
                    dadosMovimentacoes.entradas > 0
                      ? `${(dadosMovimentacoes.entradas / (dadosMovimentacoes.entradas + dadosMovimentacoes.saidas || 1)) * 100}%`
                      : '0%',
                }"
              >
                <TrendingUp
                  :size="18"
                  class="text-white animate-bounce-subtle"
                  v-if="dadosMovimentacoes.entradas > 0"
                />
              </div>
            </div>
          </div>

          <div class="animate-slide-up" style="animation-delay: 0.4s">
            <div class="flex items-center justify-between mb-2">
              <span class="text-slate-300 font-medium">Saídas</span>
              <span class="text-orange-400 font-bold text-xl animate-number">{{ dadosMovimentacoes.saidas }}</span>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-8 overflow-hidden">
              <div
                class="bg-gradient-to-r from-orange-600 to-orange-500 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3 bar-fill"
                :style="{
                  width:
                    dadosMovimentacoes.saidas > 0
                      ? `${(dadosMovimentacoes.saidas / (dadosMovimentacoes.entradas + dadosMovimentacoes.saidas || 1)) * 100}%`
                      : '0%',
                }"
              >
                <TrendingDown
                  :size="18"
                  class="text-white animate-bounce-subtle"
                  v-if="dadosMovimentacoes.saidas > 0"
                />
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-700 animate-slide-up" style="animation-delay: 0.6s">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Total de Movimentações</span>
              <span class="text-white font-bold text-2xl animate-number">
                {{ totalMovimentacoes }}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Alertas e Últimas Movimentações -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Alertas de Reposição -->
      <Card class="bg-slate-800 border-slate-700 animate-slide-left hover:shadow-2xl transition-shadow duration-300">
        <div class="flex items-center gap-2 mb-4">
          <div class="p-2 bg-orange-600 rounded-lg icon-pulse">
            <AlertTriangle class="text-white" :size="20" />
          </div>
          <h3 class="font-bold text-white text-lg">Alertas de Reposição</h3>
        </div>
        <div v-if="itensBaixoEstoque === 0" class="text-center py-12 text-slate-500 animate-fade-in">
          <p class="font-medium">✓ Sistema operando normalmente</p>
          <p class="text-sm mt-1">Nenhum item crítico detectado</p>
        </div>

        <!-- <div v-else class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          <div
            v-for="(item, index) in itensBaixoEstoque.slice(0, 5)"
            :key="item.codigo"
            class="flex items-center justify-between p-4 bg-slate-700 rounded-lg border-l-4 border-orange-500 hover:bg-slate-600 hover:scale-[1.02] transition-all duration-200 animate-slide-right"
            :style="`animation-delay: ${index * 0.1}s`"
          >
            <div>
              <p class="font-semibold text-white">{{ item.nome }}</p>
              <p class="text-xs text-slate-400 mt-1">Código: {{ item.codigo }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-2xl text-orange-400 animate-pulse-slow">{{ item.quantidade }}</p>
              <p class="text-xs text-slate-400">Mín: {{ item.minimo }}</p>
            </div>
          </div>
        </div> -->
      </Card>

      <!-- Últimas Movimentações -->
      <Card class="bg-slate-800 border-slate-700 animate-slide-right hover:shadow-2xl transition-shadow duration-300">
        <div class="flex items-center gap-2 mb-4">
          <div class="p-2 bg-indigo-600 rounded-lg icon-pulse">
            <LayoutDashboard class="text-white" :size="20" />
          </div>
          <h3 class="font-bold text-white text-lg">Últimas Movimentações</h3>
        </div>

        <div v-if="ultimasMovimentacoes === 0" class="text-center py-12 text-slate-500 animate-fade-in">
          <p class="font-medium">Nenhum registro encontrado</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(mov, index) in ultimasMovimentacoes"
            :key="mov.id"
            class="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 hover:scale-[1.02] transition-all duration-200 border-l-2 animate-slide-left"
            :class="mov.type === 'inbound' ? 'border-emerald-500' : 'border-orange-500'"
            :style="`animation-delay: ${(index as any) * 0.1}s`"
          >
            <div class="flex items-center gap-3">
              <div
                :class="mov.type === 'inbound' ? 'bg-emerald-600' : 'bg-orange-600'"
                class="p-2 rounded-lg icon-bounce"
              >
                <component :is="mov.type === 'inbound' ? TrendingUp : TrendingDown" :size="18" class="text-white" />
              </div>
              <div>
                <p class="font-semibold text-white">{{ mov.product.name }}</p>
                <p class="text-xs text-slate-400">{{ formatarData(mov.created_at) }}</p>
              </div>
            </div>
            <span
              :class="
                mov.type === 'inbound' ? 'text-emerald-400 bg-emerald-900/30' : 'text-orange-400 bg-orange-900/30'
              "
              class="font-bold text-lg px-3 py-1 rounded animate-fade-in"
            >
              {{ mov.type === "inbound" ? "+" : "-" }}{{ mov.quantity }}
            </span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #334155;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #64748b;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animações de Entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes pulseSubtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes numberCount {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes barFill {
  from {
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    transform: scaleX(1);
    transform-origin: left;
  }
}

@keyframes pieSlice {
  from {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* Classes de Animação */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-down {
  animation: slideDown 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.animate-slide-left {
  animation: slideLeft 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.animate-slide-right {
  animation: slideRight 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.animate-card {
  animation: cardAppear 0.8s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.animate-title {
  animation: slideDown 0.8s ease-out;
}

.animate-subtitle {
  animation: slideDown 1s ease-out;
}

.animate-number {
  animation: numberCount 0.8s ease-out;
}

.animate-pulse-slow {
  animation: pulse 3s ease-in-out infinite;
}

.animate-pulse-subtle {
  animation: pulseSubtle 2s ease-in-out infinite;
}

.animate-bounce-subtle {
  animation: bounce 2s ease-in-out infinite;
}

.icon-float {
  animation: float 2.5s ease-in-out infinite;
}

.icon-pulse {
  animation: pulse 1.8s ease-in-out infinite;
}

.icon-bounce {
  animation: bounce 0.8s ease-in-out infinite;
}

.bar-fill {
  animation: barFill 1.2s ease-out;
}

.pie-slice {
  animation: pieSlice 1s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}
</style>
