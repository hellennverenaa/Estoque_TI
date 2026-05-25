<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { LogIn } from 'lucide-vue-next';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'vue-sonner';

const emit = defineEmits<{
  login: []
}>();

const cracha = ref('');
const inputRef = ref<any>(null);
const authStore = useAuthStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    await authStore.ensureLoaded();
  } catch (error) {
    toast.error('Erro ao conectar com o servidor.');
  } finally {
    isLoading.value = false;
    // Focus input on load
    nextTick(() => {
      const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputEl) inputEl.focus();
    });
  }
});

const handleLogin = () => {
  try {
    authStore.login(cracha.value);
    toast.success('Login realizado com sucesso!');
    emit('login');
  } catch (error: any) {
    toast.error(error.message || 'Crachá inválido');
    cracha.value = '';
    // Re-focus after error
    const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputEl) inputEl.focus();
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#FFFFFF] to-[#F8F9FA] flex items-center justify-center p-6">
    <div 
      class="w-full max-w-md"
      v-motion
      :initial="{ opacity: 0, scale: 0.9 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 500 } }"
    >
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-2xl shadow-lg mx-auto mb-4 flex items-center justify-center">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <LogIn :size="24" class="text-white" />
          </div>
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent mb-2">
          Estoque TI
        </h1>
        <p class="text-[#6B7280]">Sistema de gerenciamento de materiais</p>
      </div>

      <Card>
        <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 gap-4 text-blue-600">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-sm font-medium">Carregando permissões...</span>
        </div>
        <form v-else @submit.prevent="handleLogin" class="space-y-6">
          <Input
            ref="inputRef"
            v-model="cracha"
            type="text"
            label="Crachá"
            placeholder="Aproxime o crachá ou digite a matrícula"
            required
            autocomplete="off"
          />

          <Button type="submit" full-width size="lg">
            <LogIn :size="20" />
            Acessar Sistema
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>
