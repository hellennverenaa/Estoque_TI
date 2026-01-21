<template>
  <v-dialog v-model="dialog" max-width="800">
    <v-card>
      <v-card-text>
        <div class="flex flex-col gap-10">
          <!-- Title -->
          <div class="space-y-3">
            <h1 class="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent text-2xl font-bold">
              Editar Material
            </h1>

            <p class="text-gray-500">
              Editando: <span class="font-mono font-bold">{{ formData.name }}</span>
            </p>
          </div>

          <!-- Dados do Formulário -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Dados Principais -->
            <Card class="md:col-span-2 border-l-4 border-l-orange-400">
              <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-2">
                  <Barcode class="text-orange-500" :size="20" />
                  <h3 class="font-semibold text-gray-800">Dados Principais</h3>
                </div>
                <div class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  Cadastrado por: {{ product.created_by }}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <Input v-model="formData.name" label="Nome do Material *" required />
                </div>
                <Select v-model="formData.category" label="Categoria *" :options="CATEGORIAS" required />
                <Input v-model="formData.serial_number" label="Número de Série" />
              </div>
            </Card>

            <!-- Estoque e Local -->
            <Card class="md:col-span-2">
              <div class="flex items-center gap-2 mb-6">
                <Archive class="text-blue-500" :size="20" />
                <h3 class="font-semibold text-gray-800">Estoque e Local</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input v-model="formData.quantity" label="Quantidade Atual" type="number" required />
                <Input v-model="formData.minimal_quantity" label="Mínimo (Alerta)" type="number" />
                <Select v-model="formData.local_storage" label="Local" :options="LOCAIS" />
                <Input v-model="formData.value" label="Valor Unit. (R$)" type="number" step="0.01" />
              </div>
            </Card>

            <Card class="md:col-span-2" v-if="showJustification">
              <div class="flex items-center gap-2 mb-6">
                <TextInitial class="text-blue-500" :size="20" />
                <h3 class="font-semibold text-gray-800">Justificativa para alteração de quantidade</h3>
              </div>

              <!-- Espaço para justificativa (em caso de edição da quantidade) -->
              <v-text-field
                v-model="formData.editReason"
                placeholder="Justificativa..."
                type="text"
                ref="justificationRef"
                variant="outlined"
                required
              />
            </Card>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn color="red" variant="outlined" @click="dialog = false"> <X :size="16" class="mr-2" /> Cancelar </v-btn>
        <v-btn color="primary" variant="outlined" @click="handleSave">Salvar <Save :size="16" class="ml-2" /></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  // import { useRouter } from "vue-router";
import { ref, onMounted, watch, nextTick } from "vue";
import { Save, X, Archive, Barcode, TextInitial } from "lucide-vue-next";
import { toast } from "vue-sonner";
import Card from "../components/Card.vue";
import Input from "../components/Input.vue";
import Select from "../components/Select.vue";
import { useMaterialStore, Material } from "../stores/materialStore";
import { LOCAIS, CATEGORIAS } from "../constants/lists";
import { UpdateProductDTO } from "../services";

// const router = useRouter();
const materialStore = useMaterialStore();

const props = defineProps<{
  product: Material;
  dialog: boolean;
  authRfid: string
}>();

const formData = ref<UpdateProductDTO & { editReason: string, id: string }>({
  id: "",
  codigo: "",
  name: "",
  category: "",
  quantity: 0,
  minimal_quantity: 0,
  value: 0,
  serial_number: "",
  local_storage: "",
  editReason: "",
});

const dialog = ref(false);
onMounted(() => {
  formData.value = { ...props.product, editReason: "" };
  dialog.value = props.dialog;
});

// Emit para controle do dialog externo em ListagemPage.vue
const emit = defineEmits<{
  update: [value: boolean];
}>();

const showJustification = ref(false);
const justificationRef = ref<HTMLInputElement | null>(null);
watch(
  () => formData.value.quantity,
  (newVal) => {
    if (Number(newVal) !== props.product.quantity) {
      showJustification.value = true;
      nextTick(() => {
        if (justificationRef.value) justificationRef.value?.focus();
      });
    } else {
      showJustification.value = false;
    }
  },
);

watch(dialog, (newVal) => {
  emit("update", newVal);
});

const handleSave = async () => {
  try {
    if ((Number(formData.value.quantity) !== Number(props.product.quantity)) && !formData.value.editReason) {
      console.log("Voce deve apresentar uma justificativa para alteração do estoque deste produto.")
      alert("Voce deve apresentar uma justificativa para alteração do estoque deste produto.")
      return
    }

    // TODO: Continuar daqui. Ja esta pronto o cadastro, listagem e dashboard
    // Constroi o payload de acordo com as alterações do usuário. Só envia dados alterados

    await materialStore.updateMaterial(props.product.id, formData.value, Number(props.authRfid))
  } catch (e: any) {
    toast.error(e.message);
  }
};
</script>
