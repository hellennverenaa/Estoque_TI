<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { 
  Search, Edit2, Trash2, Eye, Download, FileSpreadsheet, FileText, Filter, 
  X, CheckCircle, Lock 
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Badge from '../components/Badge.vue';
import Button from '../components/Button.vue';
import { useMaterialStore } from '../stores/materialStore';
import { useAuthStore } from '../stores/authStore'; 
import { exportToCSV, exportToExcel, exportToPDF, prepareMaterialsData } from '../utils/exportUtils';

// --- STORES ---
const materialStore = useMaterialStore();
const authStore = useAuthStore();

// --- DADOS ESTÁTICOS (Definidos no início para garantir existência) ---
const statusOptions = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'ok', label: 'Em Estoque' },
  { value: 'baixo', label: 'Abaixo do Mínimo' },
  { value: 'sem', label: 'Sem Estoque' }
];

// --- VARIAVEIS REATIVAS ---
const searchTerm = ref('');
const filterCategoria = ref('todas');
const filterStatus = ref('todos');

const showDetailsModal = ref(false);
const selectedMaterial = ref<any>(null);

const showEditAuthModal = ref(false);
const materialToEdit = ref<any>(null);
const authInput = ref('');
const authInputRef = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{ navigate: [page: string] }>();

// --- COMPUTEDS ---
const categorias = computed(() => {
  // Proteção contra lista vazia ou indefinida
  const lista = materialStore.materials || [];
  const cats = [...new Set(lista.map(m => m.categoria))];
  return [
    { value: 'todas', label: 'Todas as Categorias' },
    ...cats.map(c => ({ value: c, label: c }))
  ];
});

const filteredMaterials = computed(() => {
  let result = materialStore.materials || [];
  
  if (searchTerm.value) {
    const s = searchTerm.value.toLowerCase();
    result = result.filter(m => 
      (m.nome && m.nome.toLowerCase().includes(s)) || 
      (m.codigo && m.codigo.toLowerCase().includes(s)) ||
      (m.categoria && m.categoria.toLowerCase().includes(s))
    );
  }
  
  if (filterCategoria.value !== 'todas') {
    result = result.filter(m => m.categoria === filterCategoria.value);
  }
  
  if (filterStatus.value !== 'todos') {
    result = result.filter(m => getStatus(m.quantidade, m.minimo) === filterStatus.value);
  }
  return result;
});

// --- FUNÇÕES AUXILIARES ---
const getStatus = (quantidade: number, minimo: number) => {
  if (quantidade === 0) return 'sem';
  if (quantidade < minimo) return 'baixo';
  return 'ok';
};

const getStatusBadge = (quantidade: number, minimo: number) => {
  if (quantidade === 0) return { variant: 'error' as const, label: 'Esgotado' };
  if (quantidade < minimo) return { variant: 'warning' as const, label: 'Baixo' };
  return { variant: 'success' as const, label: 'OK' };
};

// --- AÇÕES DO USUÁRIO ---
const handleEditClick = (material: any) => {
  materialToEdit.value = material;
  showEditAuthModal.value = true;
  authInput.value = '';
  showDetailsModal.value = false;
  nextTick(() => {
    if (authInputRef.value) authInputRef.value.focus();
  });
};

const confirmEditAuth = () => {
  const usuario = authStore.validarCracha(authInput.value);
  // Uso de ?. para evitar erro se materialToEdit for nulo
  const dono = materialToEdit.value?.criadoPor; 

  if (!usuario) {
    toast.error('Crachá não reconhecido.');
    authInput.value = '';
    return;
  }

  // Verifica permissão (apenas se tiver dono registrado)
  if (dono && usuario.nome !== dono) {
    toast.error(`Acesso Negado! Item cadastrado por: ${dono}`);
    authInput.value = '';
    return;
  }

  toast.success(`Acesso liberado: ${usuario.nome}`);
  
  if (materialToEdit.value) {
    localStorage.setItem('material_to_edit', materialToEdit.value.codigo);
    showEditAuthModal.value = false;
    emit('navigate', 'edicao');
  }
};

const handleView = (material: any) => {
  selectedMaterial.value = material;
  showDetailsModal.value = true;
};

const handleDelete = (codigo: string) => {
  if (confirm('Tem certeza que deseja excluir este item?')) {
    materialStore.deleteMaterial(codigo);
    toast.success('Item excluído.');
  }
};

const limparFiltros = () => {
  searchTerm.value = '';
  filterCategoria.value = 'todas';
  filterStatus.value = 'todos';
};

// --- EXPORTAÇÃO ---
const exportarPDF = async () => {
  const data = prepareMaterialsData(filteredMaterials.value);
  await exportToPDF(data, 'Materiais', 'Lista', ['Nome','Categ','Cod','Qtd','Min','Local','Forn','Val','Total','Sts']);
};
const exportarCSV = () => exportToCSV(prepareMaterialsData(filteredMaterials.value), 'Materiais', []);
const exportarExcel = () => exportToExcel(prepareMaterialsData(filteredMaterials.value), 'Materiais', []);
</script>

<template>
  <div class="flex flex-col gap-10 relative">

    <div v-if="showEditAuthModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-red-100 relative">
        <button @click="showEditAuthModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X :size="24"/></button>
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="bg-red-50 p-4 rounded-full">
            <Lock :size="40" class="text-red-500" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Acesso Restrito</h3>
            <p class="text-gray-500 mt-1" v-if="materialToEdit?.criadoPor">
              Editável apenas por:<br>
              <strong class="text-red-600 text-lg">{{ materialToEdit.criadoPor }}</strong>
            </p>
            <p class="text-gray-500 mt-1" v-else>
              Bipe seu crachá para liberar a edição.
            </p>
          </div>
          <div class="w-full relative mt-4">
            <input 
              ref="authInputRef"
              v-model="authInput"
              @keyup.enter="confirmEditAuth"
              type="password"
              class="w-full text-center border-2 border-red-100 rounded-xl py-3 px-4 focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all font-bold text-gray-700 tracking-widest placeholder:font-normal"
              placeholder="Bipe seu crachá..."
            />
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showDetailsModal && selectedMaterial" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="bg-blue-700 p-6 text-white flex justify-between">
          <div>
            <h2 class="text-2xl font-bold">{{ selectedMaterial.nome }}</h2>
            <p class="opacity-80 font-mono">{{ selectedMaterial.codigo }}</p>
          </div>
          <button @click="showDetailsModal = false"><X class="text-white" /></button>
        </div>
        <div class="p-6 overflow-y-auto space-y-6">
          <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border">
            <CheckCircle :size="32" class="text-blue-600" />
            <div>
              <p class="font-bold text-gray-800">Cadastrado por</p>
              <p class="text-gray-600">{{ selectedMaterial.criadoPor || 'Não registrado' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div><p class="text-sm text-gray-500">Categoria</p><p class="font-medium capitalize">{{ selectedMaterial.categoria }}</p></div>
            <div><p class="text-sm text-gray-500">Estoque</p><p class="font-medium">{{ selectedMaterial.quantidade }} (Min: {{ selectedMaterial.minimo }})</p></div>
            <div><p class="text-sm text-gray-500">Local</p><p class="font-medium">{{ selectedMaterial.local || '-' }}</p></div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t">
          <Button variant="secondary" @click="showDetailsModal = false">Fechar</Button>
          <Button @click="handleEditClick(selectedMaterial)">
            <Edit2 :size="16" class="mr-2"/> Editar
          </Button>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent text-2xl font-bold">
        Consultar Itens
      </h1>
      <p class="text-[#6B7280]">Visualize e gerencie todos os materiais cadastrados</p>
    </div>

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
        <Input v-model="searchTerm" placeholder="Buscar por nome, código...">
          <template #icon><Search :size="20" /></template>
        </Input>
        <Select v-model="filterCategoria" label="Categoria" :options="categorias" />
        <Select v-model="filterStatus" label="Status" :options="statusOptions" />
      </div>

      <div class="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" @click="limparFiltros">Limpar Filtros</Button>
        <div class="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" @click="exportarPDF"><FileText :size="16" /> PDF</Button>
          <Button variant="secondary" size="sm" @click="exportarCSV"><FileSpreadsheet :size="16" /> CSV</Button>
          <Button variant="secondary" size="sm" @click="exportarExcel"><Download :size="16" /> Excel</Button>
        </div>
      </div>
    </Card>

    <div class="hidden lg:block">
      <Card :no-padding="true">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categ.</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filteredMaterials" :key="item.codigo" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <p class="font-medium text-gray-900">{{ item.nome }}</p>
                <p class="text-xs text-gray-400">{{ item.codigo }}</p>
              </td>
              <td class="px-6 py-4 text-gray-500 capitalize">{{ item.categoria }}</td>
              <td class="px-6 py-4 font-medium">{{ item.quantidade }}</td>
              <td class="px-6 py-4">
                <Badge :variant="getStatusBadge(item.quantidade, item.minimo).variant">
                  {{ getStatusBadge(item.quantidade, item.minimo).label }}
                </Badge>
              </td>
              <td class="px-6 py-4 flex justify-center gap-2">
                <button @click="handleView(item)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye :size="18"/></button>
                <button @click="handleEditClick(item)" class="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit2 :size="18"/></button>
                <button @click="handleDelete(item.codigo)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 :size="18"/></button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>

    <div class="lg:hidden flex flex-col gap-4">
      <Card v-for="item in filteredMaterials" :key="item.codigo">
        <div class="flex gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-[#111827] mb-1 truncate">{{ item.nome }}</h3>
            <p class="text-sm text-[#6B7280] mb-2">{{ item.categoria }}</p>
            <Badge :variant="getStatusBadge(item.quantidade, item.minimo).variant">
              {{ getStatusBadge(item.quantidade, item.minimo).label }}
            </Badge>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-[#F1F3F5] grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-gray-400">Código:</span> <span class="ml-1 text-gray-900">{{ item.codigo }}</span></div>
          <div><span class="text-gray-400">Qtd:</span> <span class="ml-1 font-bold">{{ item.quantidade }}</span></div>
        </div>
        <div class="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" class="flex-1" @click="handleView(item)"><Eye :size="16" /> Ver</Button>
          <Button variant="secondary" size="sm" class="flex-1" @click="handleEditClick(item)"><Edit2 :size="16" /> Editar</Button>
          <Button variant="danger" size="sm" @click="handleDelete(item.codigo)"><Trash2 :size="16" /></Button>
        </div>
      </Card>
    </div>
  </div>
</template>