<script setup lang="ts">
import { Menu, Bell, User } from 'lucide-vue-next';

interface HeaderProps {
  userName?: string;
}

withDefaults(defineProps<HeaderProps>(), {
  userName: 'Usuário'
});

const emit = defineEmits<{
  menuClick: []
}>();
</script>

<template>
  <header class="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-[#E5E7EB]/60 z-[900] shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03),_0_1px_3px_0_rgb(0_0_0_/_0.04)]">
    <div class="h-full px-6 lg:px-8 flex items-center justify-between gap-6">
      <!-- Left - Menu + Logo -->
      <div class="flex items-center gap-4">
        <button
          @click="emit('menuClick')"
          class="lg:hidden p-2.5 text-[#374151] hover:bg-[#F1F3F5] rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu :size="24" />
        </button>
        
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] rounded-xl shadow-sm flex items-center justify-center">
            <div class="w-6 h-6 bg-white/20 rounded-lg"></div>
          </div>
          <span class="hidden sm:block text-lg font-bold bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent">
            Estoque TI/Automação
          </span>
        </div>
      </div>
      
      <!-- Right - Notificações + User -->
      <div class="flex items-center gap-3">
        <button class="relative p-2.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
          <Bell :size="20" />
          <span class="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white animate-pulse" />
        </button>
        
        <div class="flex items-center gap-3 pl-3 ml-3 border-l border-[#E5E7EB]">
          <div class="w-9 h-9 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <User :size="20" class="text-white" />
          </div>
          <span class="hidden md:block text-[15px] font-medium text-[#374151]">{{ userName }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
