<script setup lang="ts">
import { ref } from 'vue';
import { Save, X } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';

const emit = defineEmits<{
  navigate: [page: string]
}>();

const handleSave = () => {
  toast.success('Material atualizado com sucesso!');
  emit('navigate', 'listagem');
};
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="space-y-3">
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent">
        Editar Material
      </h1>
      <p class="text-[#6B7280]">Atualize as informações do material</p>
    </div>

    <Card>
      <div class="flex justify-end gap-4">
        <Button variant="secondary" @click="emit('navigate', 'listagem')">
          <X :size="16" />
          Cancelar
        </Button>
        <Button @click="handleSave">
          <Save :size="16" />
          Salvar Alterações
        </Button>
      </div>
    </Card>
  </div>
</template>
