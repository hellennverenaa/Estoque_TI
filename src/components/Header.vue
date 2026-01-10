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
      <div class="flex items-center gap-4">
        <button
          @click="emit('menuClick')"
          class="lg:hidden p-2.5 text-[#374151] hover:bg-[#F1F3F5] rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu :size="24" />
        </button>
        
        <div class="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105">
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
          
          <div class="leading-none">
            <span class="block text-[11px] font-bold text-blue-600 tracking-widest uppercase">Controle de</span>
            <h1 class="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent tracking-tight">
              ESTOQUE <span class="text-blue-800">TI · AUTOMAÇÃO</span>
            </h1>
          </div>
        </div>
        </div>
      
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