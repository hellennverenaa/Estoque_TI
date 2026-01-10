<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { 
  Save, 
  Archive,
  Barcode,
  Wand2,
  Scan,
  X,
  Lock
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Button from '../components/Button.vue';
import { useMaterialStore } from '../stores/materialStore';
import { useAuthStore } from '../stores/authStore'; // Importar AuthStore

const materialStore = useMaterialStore();
const authStore = useAuthStore(); // Usar AuthStore

// --- Lógica de Autenticação ---
const showAuthModal = ref(false);
const authInput = ref('');
const authInputRef = ref<HTMLInputElement | null>(null);

const abrirModalAuth = () => {
  // Validação prévia do formulário antes de pedir crachá
  if (!formData.value.nome || !formData.value.codigoPrincipal || !formData.value.categoria || !formData.value.quantidade) {
    toast.error('Preencha os campos obrigatórios antes de salvar');
    return;
  }
  
  showAuthModal.value = true;
  authInput.value = '';
  // Foca no input automaticamente para o leitor de código de barras funcionar direto
  nextTick(() => {
    authInputRef.value?.focus();
  });
};

const confirmarAuth = () => {
  const usuario = authStore.validarCracha(authInput.value);
  
  if (usuario) {
    toast.success(`Autorizado por: ${usuario.nome}`);
    showAuthModal.value = false;
    processarSalvamento(); // Chama a função real de salvar
  } else {
    toast.error('Crachá não autorizado ou desconhecido');
    authInput.value = ''; // Limpa para tentar de novo
    authInputRef.value?.focus();
  }
};
// -----------------------------

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

const categorias = [
  { value: 'hardware', label: 'Hardware (Monitores, PCs, Notebooks)' },
  { value: 'perifericos', label: 'Periféricos (Mouses, Teclados)' },
  { value: 'cabos', label: 'Cabos e Adaptadores' },
  { value: 'rede', label: 'Equipamentos de Rede' },
  { value: 'consumiveis', label: 'Consumíveis (Tintas, Pilhas)' },
  { value: 'outros', label: 'Outros' },
];

const locais = [
  { value: 'prateleira_nivel_01', label: 'Prateleira Nível 01' },
  { value: 'prateleira_nivel_02', label: 'Prateleira Nível 02' },
  { value: 'prateleira_nivel_03', label: 'Prateleira Nível 03' },
  { value: 'gaveta_01', label: 'Gaveta 01' },
  { value: 'gaveta_02', label: 'Gaveta 02' },
  { value: 'gaveta_03', label: 'Gaveta 03' },
  { value: 'organizador_01', label: 'Organizador 01' },
  { value: 'organizador_02', label: 'Organizador 02' },
];

const permiteGerarCodigo = computed(() => {
  const categoriasPermitidas = ['perifericos', 'cabos', 'consumiveis', 'outros'];
  return categoriasPermitidas.includes(formData.value.categoria);
});

const gerarCodigoAutomatico = () => {
  if (!permiteGerarCodigo.value) return; 

  const random = Math.floor(100000 + Math.random() * 900000);
  const prefixo = formData.value.categoria === 'perifericos' ? 'PER' : 'GEN';
  
  formData.value.codigoPrincipal = `${prefixo}-${random}`;
  toast.info('Código automático gerado!');
};

// Renomeei a função original para ser chamada apenas APÓS autenticação
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
    });

    toast.success('Material cadastrado com sucesso!');
    
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
    toast.error(error.message || 'Erro ao salvar material');
  }
};
</script>

<template>
  <div class="space-y-6 relative">
    
    <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Lock class="text-blue-600" />
            Autorização Necessária
          </h2>
          <button @click="showAuthModal = false" class="text-gray-400 hover:text-red-500 transition-colors">
            <X :size="24" />
          </button>
        </div>

        <div class="flex flex-col items-center gap-4 py-4">
          <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse border-2 border-blue-200">
            <Scan :size="40" class="text-blue-600" />
          </div>
          <p class="text-center text-gray-600 font-medium">
            Por favor, bipar seu crachá<br>para confirmar o cadastro.
          </p>
          
          <input 
            ref="authInputRef"
            v-model="authInput"
            @keyup.enter="confirmarAuth"
            type="password"
            class="w-full text-center border-2 border-gray-300 rounded-lg py-2 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all mt-2"
            placeholder="Aguardando leitura..."
            autocomplete="off"
          />
          <p class="text-xs text-gray-400">Pressione Enter após digitar se não for automático</p>
        </div>
      </div>
    </div>

    <div class="space-y-1">
      <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
        Cadastrar Material
      </h1>
      <p class="text-gray-500">Adicione novos itens ao estoque</p>
    </div>

    <form @submit.prevent="abrirModalAuth" class="space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card class="md:col-span-2 border-l-4 border-l-blue-500">
          <div class="flex items-center gap-2 mb-6">
            <Barcode class="text-blue-500" :size="20" />
            <h3 class="font-semibold text-gray-800">Identificação</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="md:col-span-2">
              <Input
                v-model="formData.nome"
                label="Nome do Material *"
                placeholder="Ex: Mouse Logitech / Notebook Dell"
                required
              />
            </div>

            <Select
              v-model="formData.categoria"
              label="Categoria *"
              :options="categorias"
              required
            />

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Patrimônio ou Código Interno *
              </label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <Input
                    v-model="formData.codigoPrincipal"
                    :placeholder="permiteGerarCodigo ? 'Gere um código ou digite...' : 'Digite o Nº da Etiqueta'"
                    required
                  />
                </div>
                
                <button 
                  type="button"
                  @click="gerarCodigoAutomatico"
                  :disabled="!permiteGerarCodigo"
                  :title="permiteGerarCodigo ? 'Gerar código automático' : 'Selecione Periféricos ou Outros para habilitar'"
                  :class="[
                    'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border',
                    permiteGerarCodigo 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-md cursor-pointer' 
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                  ]"
                >
                  <Wand2 :size="18" />
                  <span class="text-xs font-medium">Gerar</span>
                </button>
              </div>
              
              <p class="text-xs mt-1 transition-colors" :class="permiteGerarCodigo ? 'text-blue-600 font-medium' : 'text-gray-400'">
                {{ permiteGerarCodigo 
                   ? 'Dica: Para periféricos, você pode clicar em "Gerar" para criar um ID.' 
                   : 'Para Hardware, digite obrigatoriamente o Nº do Patrimônio.' }}
              </p>
            </div>

            <div class="space-y-1">
               <Input
                v-model="formData.numeroSerie"
                label="Número de Série"
                placeholder="Ex: SN123456789"
              />
              <p class="text-xs text-gray-400">Do fabricante (Opcional)</p>
            </div>
          </div>
        </Card>

        <Card class="md:col-span-2">
          <div class="flex items-center gap-2 mb-6">
            <Archive class="text-green-600" :size="20" />
            <h3 class="font-semibold text-gray-800">Estoque e Localização</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              v-model="formData.quantidade"
              label="Quantidade Inicial *"
              type="number"
              min="0"
              required
            />

            <Input
              v-model="formData.minimo"
              label="Estoque Mínimo"
              type="number"
              min="1"
              placeholder="Aviso"
            />

            <Select
              v-model="formData.local"
              label="Local de Armazenamento"
              :options="locais"
            />

            <div class="md:col-span-1">
               <Input
                v-model="formData.valor"
                label="Valor Unitário (R$)"
                type="number"
                step="0.01"
                placeholder="0,00"
              />
            </div>
          </div>
        </Card>
      </div>

      <div class="flex justify-end pt-4">
        <Button type="submit" size="lg" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
          <Save :size="18" class="mr-2" />
          Salvar Material
        </Button>
      </div>
    </form>
  </div>
</template>