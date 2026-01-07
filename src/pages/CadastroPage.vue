<script setup lang="ts">
import { ref } from 'vue';
import { Upload, Save, X } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Textarea from '../components/Textarea.vue';
import Button from '../components/Button.vue';
import { useMaterialStore } from '../stores/materialStore';

const emit = defineEmits<{
  navigate: [page: string]
}>();

const materialStore = useMaterialStore();

const formData = ref({
  nome: '',
  categoria: '',
  descricao: '',
  numeroSerie: '',
  codigoPatrimonio: '',
  local: '',
  quantidadeAtual: '',
  quantidadeMinima: '',
  fornecedor: '',
  dataAquisicao: '',
  valor: '',
});

const imagemPreview = ref<string | null>(null);

const categorias = [
  { value: '', label: 'Selecione...' },
  { value: 'notebooks', label: 'Notebooks' },
  { value: 'monitores', label: 'Monitores' },
  { value: 'perifericos', label: 'Periféricos' },
  { value: 'cabos', label: 'Cabos e Acessórios' },
  { value: 'componentes', label: 'Componentes' },
  { value: 'outros', label: 'Outros' },
];

const locais = [
  { value: '', label: 'Selecione...' },
  { value: 'almoxarifado_1', label: 'Almoxarifado 1' },
  { value: 'almoxarifado_2', label: 'Almoxarifado 2' },
  { value: 'ti_predio_a', label: 'TI - Prédio A' },
  { value: 'ti_predio_b', label: 'TI - Prédio B' },
  { value: 'deposito', label: 'Depósito Central' },
];

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      imagemPreview.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = () => {
  const newMaterial = {
    foto: imagemPreview.value || 'https://via.placeholder.com/40',
    nome: formData.value.nome,
    categoria: categorias.find(c => c.value === formData.value.categoria)?.label || formData.value.categoria,
    codigo: formData.value.codigoPatrimonio || `PAT-${Date.now()}`,
    quantidade: parseInt(formData.value.quantidadeAtual) || 0,
    minimo: parseInt(formData.value.quantidadeMinima) || 0,
    local: locais.find(l => l.value === formData.value.local)?.label || formData.value.local,
    descricao: formData.value.descricao,
    fornecedor: formData.value.fornecedor,
    valor: parseFloat(formData.value.valor) || 0,
  };

  materialStore.addMaterial(newMaterial);
  toast.success('Material cadastrado com sucesso!', {
    description: `${newMaterial.nome} foi adicionado ao estoque.`,
  });
  
  // Resetar formulário
  formData.value = {
    nome: '',
    categoria: '',
    descricao: '',
    numeroSerie: '',
    codigoPatrimonio: '',
    local: '',
    quantidadeAtual: '',
    quantidadeMinima: '',
    fornecedor: '',
    dataAquisicao: '',
    valor: '',
  };
  imagemPreview.value = null;
  
  // Navegar para listagem
  setTimeout(() => {
    emit('navigate', 'listagem');
  }, 1000);
};

const handleCancel = () => {
  toast.warning('Cadastro cancelado');
  emit('navigate', 'dashboard');
};
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- Header -->
    <div
      class="space-y-3"
      v-motion
      :initial="{ opacity: 0, y: -10 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
    >
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent">
        Cadastrar Material
      </h1>
      <p class="text-[#6B7280]">Preencha as informações do novo item de estoque</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-8">
        <!-- Seção 1: Informações Básicas -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }"
        >
          <Card>
            <div class="flex items-center gap-3 mb-8">
              <div class="w-1.5 h-7 bg-gradient-to-b from-[#2563EB] to-[#1E40AF] rounded-full"></div>
              <h3 class="font-semibold text-[#111827]">Informações Básicas</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                v-model="formData.nome"
                label="Nome do Material *"
                placeholder="Ex: Notebook Dell Latitude 5420"
                required
              />

              <Select
                v-model="formData.categoria"
                label="Categoria *"
                :options="categorias"
                required
              />

              <div class="md:col-span-2">
                <Textarea
                  v-model="formData.descricao"
                  label="Descrição"
                  placeholder="Descreva as características e especificações do material"
                  :rows="3"
                />
              </div>
            </div>
          </Card>
        </div>

        <!-- Seção 2: Identificação -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }"
        >
          <Card>
            <div class="flex items-center gap-3 mb-8">
              <div class="w-1.5 h-7 bg-gradient-to-b from-[#10B981] to-[#059669] rounded-full"></div>
              <h3 class="font-semibold text-[#111827]">Identificação</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                v-model="formData.numeroSerie"
                label="Número de Série"
                placeholder="Ex: SN123456789"
              />

              <Input
                v-model="formData.codigoPatrimonio"
                label="Código de Patrimônio"
                placeholder="Ex: PAT-2024-001"
              />
            </div>
          </Card>
        </div>

        <!-- Seção 3: Estoque e Localização -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 300 } }"
        >
          <Card>
            <div class="flex items-center gap-3 mb-8">
              <div class="w-1.5 h-7 bg-gradient-to-b from-[#F59E0B] to-[#D97706] rounded-full"></div>
              <h3 class="font-semibold text-[#111827]">Estoque e Localização</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                v-model="formData.local"
                label="Local de Armazenamento *"
                :options="locais"
                required
              />

              <Input
                v-model="formData.quantidadeAtual"
                label="Quantidade Atual *"
                type="number"
                placeholder="0"
                min="0"
                required
              />

              <Input
                v-model="formData.quantidadeMinima"
                label="Quantidade Mínima *"
                type="number"
                placeholder="0"
                min="0"
                helper="Sistema gerará alerta quando atingir este valor"
                required
              />
            </div>
          </Card>
        </div>

        <!-- Seção 4: Fornecedor e Aquisição -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 400 } }"
        >
          <Card>
            <div class="flex items-center gap-3 mb-8">
              <div class="w-1.5 h-7 bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] rounded-full"></div>
              <h3 class="font-semibold text-[#111827]">Fornecedor e Aquisição</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                v-model="formData.fornecedor"
                label="Fornecedor"
                placeholder="Nome do fornecedor"
              />

              <Input
                v-model="formData.valor"
                label="Valor Unitário (R$)"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <Input
                v-model="formData.dataAquisicao"
                label="Data de Aquisição"
                type="date"
              />
            </div>
          </Card>
        </div>

        <!-- Seção 5: Foto do Material -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 500 } }"
        >
          <Card>
            <div class="flex items-center gap-3 mb-8">
              <div class="w-1.5 h-7 bg-gradient-to-b from-[#EC4899] to-[#DB2777] rounded-full"></div>
              <h3 class="font-semibold text-[#111827]">Foto do Material</h3>
            </div>
            
            <div class="flex flex-col gap-4">
              <div
                v-if="imagemPreview"
                class="relative w-48 h-48 rounded-xl border-2 border-[#E5E7EB] overflow-hidden shadow-md"
              >
                <img 
                  :src="imagemPreview" 
                  alt="Preview" 
                  class="w-full h-full object-cover"
                />
                <button
                  type="button"
                  @click="imagemPreview = null"
                  class="absolute top-2 right-2 p-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] shadow-lg"
                >
                  <X :size="16" />
                </button>
              </div>
              <label v-else class="w-48 h-48 border-2 border-dashed border-[#D1D5DB] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#3B82F6] hover:bg-[#F9FAFB] transition-all duration-300">
                <Upload :size="40" class="text-[#9CA3AF] mb-3" />
                <span class="text-sm font-medium text-[#6B7280]">Clique para fazer upload</span>
                <span class="text-xs text-[#9CA3AF] mt-1">PNG, JPG até 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="hidden"
                />
              </label>
            </div>
          </Card>
        </div>

        <!-- Botões de Ação -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 600 } }"
        >
          <Card class="bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6] border-2 border-dashed border-[#E5E7EB]">
            <div class="flex flex-col sm:flex-row items-center justify-end gap-4">
              <div v-motion :hover="{ scale: 1.05 }" :tap="{ scale: 0.95 }">
                <Button 
                  type="button" 
                  variant="secondary"
                  @click="handleCancel"
                >
                  <X :size="16" />
                  Cancelar
                </Button>
              </div>
              <div v-motion :hover="{ scale: 1.05 }" :tap="{ scale: 0.95 }">
                <Button type="submit">
                  <Save :size="16" />
                  Salvar Material
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  </div>
</template>
