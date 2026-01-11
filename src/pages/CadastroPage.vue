<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { 
  Save, Archive, Barcode, Wand2, Scan, X, Lock, CheckCircle, Plus,
  Info, AlertCircle 
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Button from '../components/Button.vue';
import { useMaterialStore } from '../stores/materialStore';
import { useAuthStore } from '../stores/authStore';
import { LOCAIS, CATEGORIAS } from '../constants/lists'; // <--- IMPORTAÇÃO NOVA

const materialStore = useMaterialStore();
const authStore = useAuthStore();

// --- Controles ---
const showAuthModal = ref(false);
const showSuccessModal = ref(false);
const authInput = ref('');
const authInputRef = ref<HTMLInputElement | null>(null);
const usuarioLogado = ref<string>(''); 

const formData = ref({
  nome: '',
  categoria: '',
  quantidade: '',
  minimo: '',
  local: '',
  valor: '',
  codigoPrincipal: '', 
  numeroSerie: ''
});

// (Removemos as constantes locais e usamos as importadas LOCAIS e CATEGORIAS)

const permiteGerarCodigo = computed(() => {
  return ['perifericos', 'cabos', 'consumiveis', 'outros', 'automacao'].includes(formData.value.categoria);
});

const gerarCodigoAutomatico = () => {
  if (!permiteGerarCodigo.value) return; 
  const random = Math.floor(100000 + Math.random() * 900000);
  const prefixo = formData.value.categoria.substring(0, 3).toUpperCase();
  formData.value.codigoPrincipal = `${prefixo}-${random}`;
  toast.info('Código gerado com sucesso!');
};

const abrirModalAuth = () => {
  if (!formData.value.nome || !formData.value.codigoPrincipal || !formData.value.categoria || !formData.value.quantidade) {
    toast.error('Preencha os campos obrigatórios (*)');
    return;
  }
  showAuthModal.value = true;
  authInput.value = '';
  nextTick(() => authInputRef.value?.focus());
};

const confirmarAuth = () => {
  const usuario = authStore.validarCracha(authInput.value);
  if (usuario) {
    usuarioLogado.value = usuario.nome;
    showAuthModal.value = false;
    processarSalvamento(); 
  } else {
    toast.error('Crachá não autorizado ou desconhecido');
    authInput.value = '';
    authInputRef.value?.focus();
  }
};

const processarSalvamento = () => {
  try {
    const isPatrimonio = !formData.value.codigoPrincipal.includes('-');

    materialStore.addMaterial({
      codigo: formData.value.codigoPrincipal,
      patrimonio: isPatrimonio ? formData.value.codigoPrincipal : undefined,
      numeroSerie: formData.value.numeroSerie,
      nome: formData.value.nome,
      categoria: formData.value.categoria,
      quantidade: Number(formData.value.quantidade),
      minimo: Number(formData.value.minimo),
      valor: Number(formData.value.valor),
      local: formData.value.local,
      criadoPor: usuarioLogado.value 
    });

    showSuccessModal.value = true;
    
    formData.value = {
      nome: '',
      categoria: '',
      quantidade: '',
      minimo: '',
      local: '',
      valor: '',
      codigoPrincipal: '',
      numeroSerie: ''
    };

  } catch (error: any) {
    toast.error(error.message);
  }
};
</script>

<template>
  <div class="space-y-6 relative">
    
    <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Lock class="text-blue-600" /> Confirmar Cadastro
          </h2>
          <button @click="showAuthModal = false"><X :size="24" class="text-gray-400 hover:text-red-500" /></button>
        </div>
        <div class="flex flex-col items-center gap-4 py-4">
          <Scan :size="40" class="text-blue-600 animate-pulse" />
          <p class="text-center text-gray-600">Bipe seu crachá para assinar o cadastro.</p>
          <input ref="authInputRef" v-model="authInput" @keyup.enter="confirmarAuth" type="password" class="w-full text-center border-2 border-gray-300 rounded-lg py-2 px-4 focus:border-blue-500 outline-none" placeholder="Aguardando leitura..." />
        </div>
      </div>
    </div>

    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border-t-8 border-green-500">
        <CheckCircle :size="48" class="text-green-600 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h2>
        <p class="text-gray-600 mb-6">Material cadastrado por <strong>{{ usuarioLogado }}</strong>.</p>
        <button @click="showSuccessModal = false" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Plus :size="20" /> Novo Cadastro
        </button>
      </div>
    </div>

    <div class="space-y-1">
      <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">Cadastrar Material</h1>
      <p class="text-gray-500">Preencha os dados abaixo para registrar um novo item no sistema.</p>
    </div>

    <form @submit.prevent="abrirModalAuth" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card class="md:col-span-2 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-2 mb-4">
            <Barcode class="text-blue-600" :size="24" />
            <h3 class="font-bold text-lg text-gray-800">Identificação do Item</h3>
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3">
            <Info class="text-blue-600 shrink-0 mt-0.5" :size="20" />
            <div class="text-sm text-blue-800">
              <p class="font-bold mb-1">Como preencher:</p>
              <ul class="list-disc pl-4 space-y-1 opacity-90">
                <li>Para <strong>Hardware</strong>, use o número da etiqueta de <strong>Patrimônio</strong>.</li>
                <li>Para <strong>Periféricos</strong>, clique em <Wand2 :size="12" class="inline"/> <strong>Gerar</strong> para criar um código interno.</li>
              </ul>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <Input v-model="formData.nome" label="Nome do Material *" placeholder="Ex: Mouse Dell Wireless" required />
            </div>

            <Select v-model="formData.categoria" label="Categoria *" :options="CATEGORIAS" required />

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Código / Patrimônio *</label>
              <div class="flex gap-2">
                <Input v-model="formData.codigoPrincipal" class="flex-1" placeholder="Digite ou gere..." required />
                
                <button 
                  type="button" 
                  @click="gerarCodigoAutomatico" 
                  :disabled="!permiteGerarCodigo" 
                  :class="[
                    'px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border font-medium',
                    permiteGerarCodigo 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-sm hover:shadow cursor-pointer' 
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  ]"
                  title="Gerar código automático"
                >
                  <Wand2 :size="18" />
                  <span class="hidden sm:inline">Gerar</span>
                </button>
              </div>
            </div>

            <Input v-model="formData.numeroSerie" label="Número de Série (S/N)" placeholder="Opcional" />
          </div>
        </Card>

        <Card class="md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
           <div class="flex items-center gap-2 mb-4">
            <Archive class="text-green-600" :size="24" />
            <h3 class="font-bold text-lg text-gray-800">Controle de Estoque</h3>
          </div>

          <div class="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle class="text-orange-600 shrink-0 mt-0.5" :size="20" />
            <div class="text-sm text-orange-800">
              <p class="font-bold mb-1">Dicas de Armazenamento:</p>
              <ul class="list-disc pl-4 space-y-1 opacity-90">
                <li>Defina um <strong>Estoque Mínimo</strong> para alertas.</li>
                <li>Mantenha o <strong>Local</strong> atualizado.</li>
              </ul>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input v-model="formData.quantidade" label="Quantidade Inicial *" type="number" min="0" required />
            <Input v-model="formData.minimo" label="Estoque Mínimo (Alerta)" type="number" min="1" />
            
            <Select v-model="formData.local" label="Local de Armazenamento" :options="LOCAIS" />
            
            <div class="md:col-span-1">
              <Input v-model="formData.valor" label="Valor Unitário (R$)" type="number" step="0.01" placeholder="0,00" />
            </div>
          </div>
        </Card>
      </div>

      <div class="flex justify-end pt-4">
        <Button type="submit" size="lg" class="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
          <Save :size="18" class="mr-2" /> 
          Salvar Material
        </Button>
      </div>
    </form>
  </div>
</template>