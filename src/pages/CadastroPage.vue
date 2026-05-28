<template>
  <div class="space-y-6 relative">


    <div >
      <form @submit.prevent="createProduct" class="space-y-8">
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
                  <li>
                    Para <strong>Periféricos</strong>, clique em <Wand2 :size="12" class="inline" />
                    <strong>Gerar</strong> para criar um código interno.
                  </li>
                </ul>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <Input
                  v-model="formData.name"
                  label="Nome do Material *"
                  placeholder="Ex: Mouse Dell Wireless"
                  required
                />
              </div>

              <Select v-model="formData.category" label="Categoria *" :options="CATEGORIAS" required />

              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Código / Patrimônio *</label>
                <div class="flex gap-2">
                  <Input v-model="formData.codigo" class="flex-1" placeholder="Digite ou gere..." required />

                  <button
                    type="button"
                    @click="gerarCodigoAutomatico"
                    :disabled="!permiteGerarCodigo"
                    :class="[
                      'px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border font-medium',
                      permiteGerarCodigo
                        ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-sm hover:shadow cursor-pointer'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
                    ]"
                    title="Gerar código automático"
                  >
                    <Wand2 :size="18" />
                    <span class="hidden sm:inline">Gerar</span>
                  </button>
                </div>
              </div>

              <Input v-model="formData.serial_number" label="Número de Série (S/N)" placeholder="Opcional" />
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
              <Input v-model="formData.quantity" label="Quantidade Inicial *" type="number" min="0" required />
              <Input v-model="formData.minimal_quantity" label="Estoque Mínimo (Alerta)" type="number" min="1" />

              <Select v-model="formData.local_storage" label="Local de Armazenamento" :options="settingsStore.getLocationsOptions" />

              <div class="md:col-span-1">
                <Input
                  v-model="formData.value"
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
          <Button type="submit" size="lg" class="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            <Save :size="18" class="mr-2" />
            Salvar Material
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Save, Archive, Barcode, Wand2, Info, AlertCircle } from "lucide-vue-next";
import { toast } from "vue-sonner";
import Card from "../components/Card.vue";
import Input from "../components/Input.vue";
import Select from "../components/Select.vue";
import Button from "../components/Button.vue";
import { useAuthStore } from "../stores/authStore";
import { CATEGORIAS } from "../constants/lists";
import { useMaterialStore } from "../stores/materialStore";
import { useSettingsStore } from "../stores/settingsStore";

const materialStore = useMaterialStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  authStore.ensureLoaded().catch(() => undefined);
  settingsStore.ensureLoaded().catch(() => undefined);
});

const formData = ref({
  name: "",
  category: "",
  codigo: "",
  serial_number: "",
  quantity: "",
  minimal_quantity: "",
  local_storage: "",
  value: "",
  created_by: computed(() => String(authStore.currentUser?.rfid || "")),
});

const createProduct = async () => {
  try {
    const data = {
      name: formData.value.name,
      category: formData.value.category,
      codigo: formData.value.codigo,
      serial_number: formData.value.serial_number,
      quantity: Number(formData.value.quantity),
      minimal_quantity: Number(formData.value.minimal_quantity),
      local_storage: formData.value.local_storage,
      value: formData.value.value ? Number(formData.value.value) : undefined,
      created_by: Number(authStore.currentUser?.rfid),
    }
    
    await materialStore.createMaterial(data, String(authStore.currentUser?.rfid));
    toast.success("Produto criado com sucesso!");
    // limpar o formulário
    formData.value = {
      name: "",
      category: "",
      codigo: "",
      serial_number: "",
      quantity: "",
      minimal_quantity: "",
      local_storage: "",
      value: "",
    };
  } catch (error) {
    toast.error("Erro ao criar produto!");
    console.log("Erro ao criar produto: ", error);
    // TODO: Criar feedback de erro
  }
};

const permiteGerarCodigo = computed(() => {
  return ["perifericos", "cabos", "consumiveis", "outros", "automacao"].includes(formData.value.category);
});

const gerarCodigoAutomatico = () => {
  if (!permiteGerarCodigo.value) return;
  const random = Math.floor(100000 + Math.random() * 900000);
  const prefixo = formData.value.category.substring(0, 3).toUpperCase();
  formData.value.codigo = `${prefixo}-${random}`;
  toast.info("Código gerado com sucesso!");
};
</script>
