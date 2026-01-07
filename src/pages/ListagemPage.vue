<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Edit2, Trash2, Eye, Download, FileSpreadsheet, FileText, Filter } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Badge from '../components/Badge.vue';
import Button from '../components/Button.vue';
import { useMaterialStore } from '../stores/materialStore';
import { exportToCSV, exportToExcel, exportToPDF, prepareMaterialsData } from '../utils/exportUtils';

const emit = defineEmits<{
  navigate: [page: string]
}>();

const materialStore = useMaterialStore();
const searchTerm = ref('');
const filterCategoria = ref('todas');
const filterStatus = ref('todos');

// Categorias únicas
const categorias = computed(() => {
  const cats = [...new Set(materialStore.materials.map(m => m.categoria))];
  return [
    { value: 'todas', label: 'Todas as Categorias' },
    ...cats.map(c => ({ value: c, label: c }))
  ];
});

const statusOptions = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'ok', label: 'Em Estoque' },
  { value: 'baixo', label: 'Abaixo do Mínimo' },
  { value: 'sem', label: 'Sem Estoque' }
];

// Materiais filtrados
const filteredMaterials = computed(() => {
  let result = materialStore.materials;

  // Filtro por busca
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    result = result.filter(m => 
      m.nome.toLowerCase().includes(search) ||
      m.categoria.toLowerCase().includes(search) ||
      m.codigo.toLowerCase().includes(search) ||
      m.local.toLowerCase().includes(search)
    );
  }

  // Filtro por categoria
  if (filterCategoria.value !== 'todas') {
    result = result.filter(m => m.categoria === filterCategoria.value);
  }

  // Filtro por status
  if (filterStatus.value !== 'todos') {
    result = result.filter(m => {
      const status = getStatus(m.quantidade, m.minimo);
      return status === filterStatus.value;
    });
  }

  return result;
});

const getStatus = (quantidade: number, minimo: number) => {
  if (quantidade === 0) return 'sem';
  if (quantidade < minimo) return 'baixo';
  return 'ok';
};

const getStatusBadge = (quantidade: number, minimo: number) => {
  if (quantidade === 0) return { variant: 'error' as const, label: 'Sem estoque' };
  if (quantidade < minimo) return { variant: 'warning' as const, label: 'Abaixo do mínimo' };
  return { variant: 'success' as const, label: 'Em estoque' };
};

const handleDelete = (codigo: string, nome: string) => {
  if (confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
    materialStore.deleteMaterial(codigo);
    toast.success('Material excluído com sucesso!');
  }
};

const limparFiltros = () => {
  searchTerm.value = '';
  filterCategoria.value = 'todas';
  filterStatus.value = 'todos';
  toast.info('Filtros limpos');
};

// Exportações
const exportarPDF = async () => {
  const data = prepareMaterialsData(filteredMaterials.value);
  const headers = ['Nome', 'Categoria', 'Código', 'Quantidade', 'Mínimo', 'Local', 'Fornecedor', 'Valor', 'Valor Total', 'Status'];
  await exportToPDF(data, `Listagem_Materiais_${new Date().toISOString().split('T')[0]}`, 'Listagem de Materiais', headers);
  toast.success('PDF exportado com sucesso!');
};

const exportarCSV = () => {
  const data = prepareMaterialsData(filteredMaterials.value);
  const headers = ['Nome', 'Categoria', 'Código', 'Quantidade', 'Mínimo', 'Local', 'Fornecedor', 'Valor', 'Valor Total', 'Status'];
  exportToCSV(data, `Listagem_Materiais_${new Date().toISOString().split('T')[0]}`, headers);
  toast.success('CSV exportado com sucesso!');
};

const exportarExcel = () => {
  const data = prepareMaterialsData(filteredMaterials.value);
  const headers = ['Nome', 'Categoria', 'Código', 'Quantidade', 'Mínimo', 'Local', 'Fornecedor', 'Valor', 'Valor Total', 'Status'];
  exportToExcel(data, `Listagem_Materiais_${new Date().toISOString().split('T')[0]}`, headers);
  toast.success('Excel exportado com sucesso!');
};
</script>

<template>
  <div class="flex flex-col gap-10">
    <div
      class="space-y-3"
      v-motion
      :initial="{ opacity: 0, y: -10 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
    >
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent">
        Consultar Itens
      </h1>
      <p class="text-[#6B7280]">Visualize e gerencie todos os materiais cadastrados</p>
    </div>

    <!-- Busca e Filtros -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }"
    >
      <Card>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
            <Filter :size="24" class="text-[#2563EB]" />
          </div>
          <div>
            <h3 class="font-semibold text-[#111827]">Filtros de Busca</h3>
            <p class="text-sm text-[#6B7280]">{{ filteredMaterials.length }} materiais encontrados</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            v-model="searchTerm"
            placeholder="Buscar por nome, categoria ou código..."
          >
            <template #icon>
              <Search :size="20" />
            </template>
          </Input>

          <Select
            v-model="filterCategoria"
            label="Categoria"
            :options="categorias"
          />

          <Select
            v-model="filterStatus"
            label="Status"
            :options="statusOptions"
          />
        </div>

        <div class="flex flex-wrap gap-3">
          <Button variant="ghost" size="sm" @click="limparFiltros">
            Limpar Filtros
          </Button>
          
          <div class="ml-auto flex gap-2">
            <Button variant="secondary" size="sm" @click="exportarPDF">
              <FileText :size="16" />
              PDF
            </Button>
            <Button variant="secondary" size="sm" @click="exportarCSV">
              <FileSpreadsheet :size="16" />
              CSV
            </Button>
            <Button variant="secondary" size="sm" @click="exportarExcel">
              <Download :size="16" />
              Excel
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Desktop Table -->
    <div
      class="hidden lg:block"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }"
    >
      <Card :no-padding="true">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Material</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Categoria</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Código</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Quantidade</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Local</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Valor Unit.</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-[#F1F3F5]">
              <tr
                v-for="material in filteredMaterials"
                :key="material.codigo"
                class="hover:bg-[#F8F9FA] transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img :src="material.foto" :alt="material.nome" class="w-10 h-10 rounded-lg object-cover" />
                    <span class="font-medium text-[#111827]">{{ material.nome }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-[#6B7280]">{{ material.categoria }}</td>
                <td class="px-6 py-4 text-[#6B7280] font-mono text-sm">{{ material.codigo }}</td>
                <td class="px-6 py-4">
                  <span class="font-semibold text-[#111827]">{{ material.quantidade }}</span>
                  <span class="text-[#9CA3AF] text-sm"> / {{ material.minimo }}</span>
                </td>
                <td class="px-6 py-4 text-[#6B7280]">{{ material.local }}</td>
                <td class="px-6 py-4 text-[#6B7280]">
                  {{ material.valor ? `R$ ${material.valor.toFixed(2)}` : '-' }}
                </td>
                <td class="px-6 py-4">
                  <Badge :variant="getStatusBadge(material.quantidade, material.minimo).variant">
                    {{ getStatusBadge(material.quantidade, material.minimo).label }}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button class="p-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors">
                      <Eye :size="18" />
                    </button>
                    <button class="p-2 text-[#6B7280] hover:text-[#F59E0B] hover:bg-[#FFFBEB] rounded-lg transition-colors">
                      <Edit2 :size="18" />
                    </button>
                    <button 
                      @click="handleDelete(material.codigo, material.nome)"
                      class="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mensagem vazia -->
          <div v-if="filteredMaterials.length === 0" class="text-center py-12">
            <p class="text-[#9CA3AF]">Nenhum material encontrado com os filtros aplicados</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Mobile Cards -->
    <div class="lg:hidden flex flex-col gap-4">
      <Card
        v-for="material in filteredMaterials"
        :key="material.codigo"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <div class="flex gap-4">
          <img :src="material.foto" :alt="material.nome" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-[#111827] mb-1 truncate">{{ material.nome }}</h3>
            <p class="text-sm text-[#6B7280] mb-2">{{ material.categoria }}</p>
            <Badge :variant="getStatusBadge(material.quantidade, material.minimo).variant">
              {{ getStatusBadge(material.quantidade, material.minimo).label }}
            </Badge>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-[#F1F3F5] grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-[#9CA3AF]">Código:</span>
            <span class="ml-2 font-mono text-[#111827]">{{ material.codigo }}</span>
          </div>
          <div>
            <span class="text-[#9CA3AF]">Qtd:</span>
            <span class="ml-2 font-semibold text-[#111827]">{{ material.quantidade }}/{{ material.minimo }}</span>
          </div>
          <div>
            <span class="text-[#9CA3AF]">Local:</span>
            <span class="ml-2 text-[#111827]">{{ material.local }}</span>
          </div>
          <div>
            <span class="text-[#9CA3AF]">Valor:</span>
            <span class="ml-2 text-[#111827]">{{ material.valor ? `R$ ${material.valor.toFixed(2)}` : '-' }}</span>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" full-width>
            <Eye :size="16" />
            Ver
          </Button>
          <Button variant="secondary" size="sm" full-width>
            <Edit2 :size="16" />
            Editar
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            @click="handleDelete(material.codigo, material.nome)"
          >
            <Trash2 :size="16" />
          </Button>
        </div>
      </Card>

      <!-- Mensagem vazia -->
      <Card v-if="filteredMaterials.length === 0">
        <div class="text-center py-8">
          <p class="text-[#9CA3AF]">Nenhum material encontrado</p>
        </div>
      </Card>
    </div>
  </div>
</template>
