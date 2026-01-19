<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Menu, Bell, User, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
import { useMaterialStore } from '../stores/materialStore';

interface HeaderProps {
  userName?: string;
}

withDefaults(defineProps<HeaderProps>(), {
  userName: 'Usuário'
});

const emit = defineEmits<{
  menuClick: [],
  logout: [] // Novo evento de logout
}>();

const materialStore = useMaterialStore();

onMounted(() => {
  materialStore.ensureLoaded().catch(() => undefined);
});

// Estados dos menus
const showNotifications = ref(false);
const showProfileMenu = ref(false);

// Lógica simples de notificação
const alertas = computed(() => materialStore.materials.filter(m => m.quantidade <= m.minimo));
const temNotificacao = computed(() => alertas.value.length > 0);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showProfileMenu.value = false;
};

const toggleProfile = () => {
  showProfileMenu.value = !showProfileMenu.value;
  showNotifications.value = false;
};
</script>

<template>
  <header class="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-[#E5E7EB]/60 z-[900] shadow-sm">
    <div class="h-full px-6 lg:px-8 flex items-center justify-between gap-6">
      
      <div class="flex items-center gap-4">
        <button
          @click="emit('menuClick')"
          class="lg:hidden p-2 text-[#374151] hover:bg-[#F1F3F5] rounded-xl transition-all"
        >
          <Menu :size="24" />
        </button>
        
        <div class="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none">
            <defs>
              <linearGradient id="tech-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#2563EB" />
                <stop offset="100%" stop-color="#1E40AF" />
              </linearGradient>
            </defs>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="url(#tech-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.27 6.96 12 12.01l8.73-5.05" stroke="url(#tech-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 22.08V12" stroke="url(#tech-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="2" fill="url(#tech-grad)" class="animate-pulse"/>
            <path d="M7.5 10.5 5.5 9.5M16.5 10.5l2-1" stroke="url(#tech-grad)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <div class="leading-none hidden sm:block">
            <span class="block text-[11px] font-bold text-blue-600 tracking-widest uppercase">Controle de</span>
            <h1 class="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent tracking-tight">
              ESTOQUE <span class="text-blue-800">TI · AUTOMAÇÃO</span>
            </h1>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-4 relative">
        
        <div class="relative">
          <button 
            @click="toggleNotifications"
            class="relative p-2.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] rounded-xl transition-all active:scale-95"
          >
            <Bell :size="20" />
            <span v-if="temNotificacao" class="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EF4444] rounded-full ring-2 ring-white animate-pulse" />
          </button>

          <div v-if="showNotifications" class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
            <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle :size="16" class="text-orange-500"/> Alertas de Estoque
            </h3>
            <div v-if="alertas.length > 0" class="max-h-60 overflow-y-auto space-y-2">
              <div v-for="item in alertas.slice(0, 5)" :key="item.codigo" class="text-sm p-2 bg-red-50 rounded-lg text-red-700 border border-red-100">
                <strong>{{ item.nome }}</strong> está com estoque baixo ({{ item.quantidade }}).
              </div>
              <div v-if="alertas.length > 5" class="text-xs text-center text-gray-500 pt-2">
                + {{ alertas.length - 5 }} outros itens
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 text-center py-4 flex flex-col items-center">
              <CheckCircle2 :size="32" class="text-green-500 mb-2"/>
              Tudo certo com o estoque!
            </div>
          </div>
        </div>
        
        <div class="relative pl-4 border-l border-[#E5E7EB]">
          <button 
            @click="toggleProfile"
            class="flex items-center gap-3 group focus:outline-none"
          >
            <div class="w-9 h-9 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              <User :size="18" class="text-white" />
            </div>
            <span class="hidden md:block text-[14px] font-medium text-[#374151] group-hover:text-blue-700 transition-colors">
              {{ userName }}
            </span>
          </button>

          <div v-if="showProfileMenu" class="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div class="px-3 py-2 border-b border-gray-100 mb-2">
              <p class="text-xs text-gray-500 font-bold uppercase">Conta</p>
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            </div>
            <button 
              @click="emit('logout')"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut :size="16" />
              Sair do Sistema
            </button>
          </div>
        </div>

      </div>
    </div>
    
    <div v-if="showNotifications || showProfileMenu" @click="showNotifications = false; showProfileMenu = false" class="fixed inset-0 z-40 bg-transparent"></div>
  </header>
</template>