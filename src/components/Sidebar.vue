<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'; // Importar hooks do router
import { 
  LayoutDashboard, 
  Package, 
  ListChecks, 
  ArrowDownUp, 
  AlertTriangle, 
  FileText, 
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
}

withDefaults(defineProps<SidebarProps>(), {
  isCollapsed: false
});

const emit = defineEmits<{
  close: []
  toggleCollapse: []
}>();

const router = useRouter();
const route = useRoute(); // Para saber em qual página estamos

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'cadastro', label: 'Cadastrar Material', icon: Package, path: '/cadastro' },
  { id: 'listagem', label: 'Consultar Itens', icon: ListChecks, path: '/listagem' },
  { id: 'movimentacao', label: 'Movimentação', icon: ArrowDownUp, path: '/movimentacao' },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle, path: '/alertas' },
  { id: 'relatorios', label: 'Relatórios', icon: FileText, path: '/relatorios' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

const handleNavigate = (path: string) => {
  router.push(path); // Navega usando a URL
  emit('close');
};
</script>

<template>
  <div 
    v-if="isOpen"
    class="lg:hidden fixed inset-0 bg-black/40 z-[840] animate-fade-in backdrop-blur-sm"
    @click="emit('close')"
  />
  
  <aside
    class="fixed top-16 left-0 bottom-0 bg-white border-r border-[#E5E7EB]/60 z-[850] shadow-[0_4px_6px_-2px_rgb(0_0_0_/_0.05),_0_10px_15px_-3px_rgb(0_0_0_/_0.08)] transition-all duration-300 ease-in-out"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isCollapsed ? 'lg:w-20' : 'w-72'
    ]"
  >
    <div class="h-full flex flex-col overflow-y-auto">
      <div class="lg:hidden flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
        <span class="text-lg font-bold text-[#111827]">Menu</span>
        <button
          @click="emit('close')"
          class="p-2 text-[#6B7280] hover:bg-white hover:text-[#111827] rounded-lg transition-colors"
        >
          <X :size="20" />
        </button>
      </div>
      
      <div class="hidden lg:flex items-center justify-end px-4 py-3 border-b border-[#E5E7EB]">
        <button
          @click="emit('toggleCollapse')"
          class="p-2 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-lg transition-colors"
          :title="isCollapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <ChevronRight v-if="isCollapsed" :size="20" />
          <ChevronLeft v-else :size="20" />
        </button>
      </div>
      
      <nav class="flex-1 p-4">
        <ul class="flex flex-col gap-1.5">
          <li v-for="item in menuItems" :key="item.id">
            <button
              @click="handleNavigate(item.path)"
              class="w-full flex items-center rounded-xl transition-all duration-200 text-left font-medium"
              :class="[
                isCollapsed ? 'justify-center px-3 py-3.5' : 'gap-3 px-4 py-3.5',
                route.path === item.path 
                  ? 'bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB] shadow-sm' 
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
              ]"
              :title="isCollapsed ? item.label : undefined"
            >
              <component 
                :is="item.icon" 
                :size="20" 
                class="flex-shrink-0"
                :class="route.path === item.path ? 'text-[#3B82F6]' : ''"
              />
              <span v-if="!isCollapsed" class="text-[15px]">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>