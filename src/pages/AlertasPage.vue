<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { AlertTriangle, Package, Send } from 'lucide-vue-next'; // Ícones novos importados
import Card from '../components/Card.vue';
import Badge from '../components/Badge.vue';
import Button from '../components/Button.vue';
import { useMaterialStore } from '../stores/materialStore';

const emit = defineEmits<{
  navigate: [page: string]
}>();

const materialStore = useMaterialStore();

onMounted(() => {
  materialStore.ensureLoaded().catch(() => undefined);
});

const materiaisAbaixoDoMinimo = computed(() =>
  materialStore.materials.filter(m => m.quantidade < m.minimo)
);

const materiaisSemEstoque = computed(() =>
  materialStore.materials.filter(m => m.quantidade === 0)
);

// Função para gerar o link de email e abrir o cliente de email
const solicitarReabastecimento = (material: any) => {
  const assunto = encodeURIComponent(`Solicitação de Reabastecimento: ${material.nome}`);
  const corpo = encodeURIComponent(
`Olá,

Gostaria de solicitar o reabastecimento do seguinte item:

- Item: ${material.nome}
- Código: ${material.codigo}
- Categoria: ${material.categoria}
- Estoque Atual: ${material.quantidade}
- Estoque Mínimo Desejado: ${material.minimo}

Aguardo retorno sobre prazos e valores.

Atenciosamente.`
  );

  // Abre o cliente de email padrão
  window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
};
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="space-y-3">
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent text-2xl font-bold">
        Alertas de Estoque
      </h1>
      <p class="text-[#6B7280]">Gerencie itens críticos e solicite reposição</p>
    </div>

    <Card variant="error" v-if="materiaisSemEstoque.length > 0">
      <div class="flex items-start gap-4 mb-6">
        <div class="w-12 h-12 bg-[#EF4444] bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle :size="24" class="text-[#EF4444]" />
        </div>
        <div>
          <h3 class="font-semibold text-[#991B1B] mb-1 text-lg">Esgotados ({{ materiaisSemEstoque.length }})</h3>
          <p class="text-sm text-[#991B1B] opacity-90">Estes itens precisam de reposição urgente.</p>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="material in materiaisSemEstoque"
          :key="material.codigo"
          class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-red-100 gap-4"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
              <img 
                v-if="material.foto" 
                :src="material.foto" 
                :alt="material.nome" 
                class="w-full h-full rounded-lg object-cover" 
              />
              <Package v-else :size="24" stroke-width="1.5" />
            </div>
            
            <div>
              <p class="font-bold text-[#111827]">{{ material.nome }}</p>
              <p class="text-sm text-[#6B7280]">Cod: {{ material.codigo }} • {{ material.categoria }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <Badge variant="error" class="shrink-0">SEM ESTOQUE</Badge>
            <Button 
              size="sm" 
              variant="secondary" 
              @click="solicitarReabastecimento(material)"
              class="text-red-700 hover:bg-red-50 border-red-200"
            >
              <Send :size="14" class="mr-2" />
              Solicitar
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <Card variant="warning" v-if="materiaisAbaixoDoMinimo.length > 0">
      <div class="flex items-start gap-4 mb-6">
        <div class="w-12 h-12 bg-[#F59E0B] bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle :size="24" class="text-[#F59E0B]" />
        </div>
        <div>
          <h3 class="font-semibold text-[#92400E] mb-1 text-lg">Abaixo do Mínimo ({{ materiaisAbaixoDoMinimo.length }})</h3>
          <p class="text-sm text-[#92400E] opacity-90">Planeje a compra destes materiais.</p>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="material in materiaisAbaixoDoMinimo"
          :key="material.codigo"
          class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-orange-100 gap-4"
        >
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
              <img 
                v-if="material.foto" 
                :src="material.foto" 
                :alt="material.nome" 
                class="w-full h-full rounded-lg object-cover" 
              />
              <Package v-else :size="24" stroke-width="1.5" />
            </div>

            <div>
              <p class="font-bold text-[#111827]">{{ material.nome }}</p>
              <div class="text-sm text-[#6B7280] flex gap-2">
                <span>Atual: <strong class="text-orange-600">{{ material.quantidade }}</strong></span>
                <span class="text-gray-300">|</span>
                <span>Mínimo: {{ material.minimo }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Badge variant="warning" class="shrink-0">BAIXO</Badge>
             <Button 
              size="sm" 
              variant="secondary" 
              @click="solicitarReabastecimento(material)"
              class="text-orange-700 hover:bg-orange-50 border-orange-200"
            >
              <Send :size="14" class="mr-2" />
              Solicitar
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <Card v-if="materiaisAbaixoDoMinimo.length === 0 && materiaisSemEstoque.length === 0" variant="success">
      <div class="text-center py-12">
        <div class="w-20 h-20 bg-[#10B981] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Package :size="40" class="text-[#10B981]" />
        </div>
        <h3 class="font-bold text-[#166534] text-xl mb-2">Estoque Saudável!</h3>
        <p class="text-[#166534] opacity-80">Nenhum material requer atenção no momento.</p>
      </div>
    </Card>
  </div>
</template>