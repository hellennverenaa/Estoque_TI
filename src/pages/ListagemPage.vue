<template>
  <div class="flex flex-col gap-10 relative">
    <!-- Auth Modal -->
    <div
      v-if="showEditAuthModal"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-red-100 relative">
        <button @click="showEditAuthModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-red-500">
          <X :size="24" />
        </button>
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="bg-red-50 p-4 rounded-full">
            <Lock :size="40" class="text-red-500" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Acesso Restrito</h3>
            <p class="text-gray-500 mt-1">Bipe seu crachá para liberar a edição.</p>
          </div>

          <div class="w-full relative mt-4">
            <v-text-field
              ref="authInputRef"
              v-model="authInput"
              @keyup.enter="confirmEditAuth"
              type="password"
              placeholder="Bipe seu crachá..."
              variant="outlined"
              color="blue"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Detalhes produtos -->
    <div
      v-if="showDetailsModal && selectedMaterial"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="bg-blue-700 p-6 text-white flex justify-between">
          <div>
            <h2 class="text-2xl font-bold">{{ selectedMaterial.name }}</h2>
            <p class="opacity-80 font-mono">{{ selectedMaterial.codigo || "Sem Código" }}</p>
          </div>
          <button @click="showDetailsModal = false"><X class="text-white" /></button>
        </div>

        <div class="p-6 overflow-y-auto space-y-6">
          <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border">
            <CheckCircle :size="32" class="text-blue-600" />
            <div>
              <p class="font-bold text-gray-800">Cadastrado por</p>
              <p class="text-gray-600">Rfid: {{ selectedMaterial.created_by || "Não registrado" }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-500">Categoria</p>
              <p class="font-medium capitalize">{{ selectedMaterial.category }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Estoque</p>
              <p class="font-medium">
                {{ selectedMaterial.quantity }} - (Min: {{ selectedMaterial.minimal_quantity }})
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Local</p>
              <p class="font-medium">{{ selectedMaterial.local_storage || "-" }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t">
          <Button variant="secondary" @click="showDetailsModal = false">Fechar</Button>
          <Button @click="handleEditClick(selectedMaterial)"> <Edit2 :size="16" class="mr-2" /> Editar </Button>
        </div>
      </div>
    </div>

    <!-- Titulo da pagina -->
    <div class="space-y-3">
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent text-2xl font-bold">
        Consultar Itens
      </h1>
      <p class="text-[#6B7280]">Visualize e gerencie todos os materiais cadastrados</p>
    </div>

    <!-- Filtros -->
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

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input v-model="searchProductName" label="Buscar Nome" placeholder="Buscar por nome" class="w-full">
            <template #icon><Search :size="20" /></template>
          </Input>

          <Input
            v-model="searchProductCode"
            label="Buscar Código/N° série"
            placeholder="Buscar por código ou número de série"
            class="w-full"
          >
            <template #icon><Search :size="20" /></template>
          </Input>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select v-model="filters.category" label="Categoria" :options="categorias" class="w-full" />
          <Select v-model="filters.stock_status" label="Status" :options="statusOptions" class="w-full" />
          <Select v-model="filters.local_storage" label="Localização" :options="localOptions" class="w-full" />
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          <Button variant="danger" size="sm" @click="limparFiltros"> Limpar Filtros </Button>
        </div>
      </div>
    </Card>

    <!-- Lista de Produtos Desktop -->
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
                <p class="font-medium text-gray-900">{{ item.name }}</p>
                <p class="text-xs text-gray-400">{{ item.codigo }}</p>
              </td>
              <td class="px-6 py-4 text-gray-500 capitalize">{{ item.category }}</td>
              <td class="px-6 py-4 font-medium">{{ item.quantity }}</td>
              <td class="px-6 py-4">
                <Badge :variant="getStatusBadge(item.quantity, item.minimal_quantity).variant">
                  {{ getStatusBadge(item.quantity, item.minimal_quantity).label }}
                </Badge>
              </td>
              <td class="px-6 py-4 flex justify-center gap-2">
                <button
                  @click="handleView(item)"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Eye :size="18" />
                </button>
                <button
                  @click="handleEditClick(item)"
                  class="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                >
                  <Edit2 :size="18" />
                </button>
                <!-- <button @click="handleDelete(item?.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 :size="18"/></button> -->
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>

    <!-- Lista Produtos Mobile -->
    <div class="lg:hidden flex flex-col gap-4">
      <Card v-for="item in filteredMaterials" :key="item.codigo">
        <div class="flex gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-[#111827] mb-1 truncate">{{ item.name }}</h3>
            <p class="text-sm text-[#6B7280] mb-2">{{ item.category }}</p>
            <Badge :variant="getStatusBadge(item.quantity, item.minimal_quantity).variant">
              {{ getStatusBadge(item.quantity, item.minimal_quantity).label }}
            </Badge>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-[#F1F3F5] grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-400">Código:</span> <span class="ml-1 text-gray-900">{{ item.codigo }}</span>
          </div>
          <div>
            <span class="text-gray-400">Qtd:</span> <span class="ml-1 font-bold">{{ item.quantity }}</span>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" class="flex-1" @click="handleView(item)"><Eye :size="16" /> Ver</Button>
          <Button variant="secondary" size="sm" class="flex-1" @click="handleEditClick(item)"
            ><Edit2 :size="16" /> Editar</Button
          >
          <!-- <Button variant="danger" size="sm" @click="handleDelete(item.codigo)"><Trash2 :size="16" /></Button> -->
        </div>
      </Card>
    </div>

    <!-- Modal Edição de Produto -->
    <div v-if="materialToEdit && openEditDialog">
      <EdicaoPage @update="emitUpdatedProduct" :product="materialToEdit" :dialog="openEditDialog" :authRfid="authInput"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Search, Edit2, Eye, Filter, X, CheckCircle, Lock } from "lucide-vue-next";

// Components
import Card from "../components/Card.vue";
import Input from "../components/Input.vue";
import Select from "../components/Select.vue";
import Badge from "../components/Badge.vue";
import Button from "../components/Button.vue";
import EdicaoPage from "../components/EdicaoPage.vue";

// Stores
import { useMaterialStore } from "../stores/materialStore";
import { useAuthStore } from "../stores/authStore";

// types
import { ProductListFilters } from "../services/productsApi";

const router = useRouter();
const materialStore = useMaterialStore();
const authStore = useAuthStore();

onMounted(() => {
  materialStore.ensureLoaded().catch(() => undefined);
  authStore.ensureLoaded().catch(() => undefined);
});

// Usuarios permitidos
const allowedUsers = computed(() => authStore.usuarios || []);

// Filtros
const statusOptions = [
  { value: "", label: "Todos os Status" },
  { value: "in_stock", label: "Em Estoque" },
  { value: "low_stock", label: "Abaixo do Mínimo" },
  { value: "out_stock", label: "Sem Estoque" },
];

const filters = ref<ProductListFilters>({
  category: "",
  stock_status: undefined,
  codigo: "",
  serial_number: "",
  local_storage: "",
});
const searchProductName = ref("");
const searchProductCode = ref("");

watch(
  () => filters.value,
  async (newValue) => {
    console.log("Filtros atualizados:", newValue);
    await materialStore.fetchMaterials(filters.value);
  },
  { deep: true },
);

const limparFiltros = () => {
  searchProductName.value = "";
  searchProductCode.value = "";

  filters.value = {
    category: "",
    stock_status: undefined,
    codigo: "",
    serial_number: "",
    local_storage: "",
  };
};

// Auth Modals
const showDetailsModal = ref(false);
const selectedMaterial = ref<any>(null);

const showEditAuthModal = ref(false);
const materialToEdit = ref<any>(null);
const authInput = ref("");
const authInputRef = ref<HTMLInputElement | null>(null);
const isAuthenticated = ref(false);

// Ações
const handleEditClick = (material: any) => {
  materialToEdit.value = material;
  showEditAuthModal.value = true;
  authInput.value = "";
  showDetailsModal.value = false;
  nextTick(() => {
    if (authInputRef.value) authInputRef.value.focus();
  });
};

const openEditDialog = ref(false)
const confirmEditAuth = () => {
  if (!materialToEdit.value) {
    toast.error("Nenhum material selecionado para edição.");
    console.warn("Nenhuma material selecionado para edição");

    showEditAuthModal.value = false;
    return;
  }

  const user = allowedUsers.value.find((u) => u.rfid === authInput.value.trim());
  if (!user) {
    toast.error("Crachá não reconhecido.");
    authInput.value = "";
    return;
  }
  toast.success(`Acesso liberado: ${user.username}`);
  showEditAuthModal.value = false;

  isAuthenticated.value = true;
  openEditDialog.value = true;
};

// Função capta alteração do dialog de edição para atualizar as variaveis locais de verificação
const emitUpdatedProduct = (value: boolean) => {
  openEditDialog.value = value;
  isAuthenticated.value = false;
};

const handleView = (material: any) => {
  selectedMaterial.value = material;
  showDetailsModal.value = true;
};

// --- COMPUTEDS ---
const categorias = computed(() => {
  const lista = materialStore.materials || [];
  const cats = [...new Set(lista.map((m) => m.category))];
  return [{ value: "", label: "Todas as Categorias" }, ...cats.map((c) => ({ value: c, label: c }))];
});

const localOptions = computed(() => {
  const lista = materialStore.materials || [];
  const locais = [...new Set(lista.map((m) => m.local_storage).filter((l) => l && l.trim() !== ""))];
  return [{ value: "", label: "Todos os Locais" }, ...locais.map((l) => ({ value: l!, label: l! }))];
});

const filteredMaterials = computed(() => {
  let result = materialStore.materials || [];

  if (searchProductName.value) {
    const s = searchProductName.value.toLowerCase();
    result = result.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(s)) ||
        (m.codigo && m.codigo.toLowerCase().includes(s)) ||
        (m.category && m.category.toLowerCase().includes(s)),
    );
  }

  return result;
});

// --- FUNÇÕES AUXILIARES ---
// const getStatus = (quantidade: number, minimo: number) => {
//   if (quantidade === 0) return "sem";
//   if (quantidade < minimo) return "baixo";
//   return "ok";
// };

const getStatusBadge = (quantidade: number, minimo: number) => {
  if (quantidade === 0) return { variant: "error" as const, label: "Esgotado" };
  if (quantidade < minimo) return { variant: "warning" as const, label: "Baixo" };
  return { variant: "success" as const, label: "OK" };
};
</script>
