<script setup lang="ts">
import { ref } from 'vue';
import { Toaster } from 'vue-sonner';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import DashboardPage from './pages/DashboardPage.vue';
import CadastroPage from './pages/CadastroPage.vue';
import ListagemPage from './pages/ListagemPage.vue';
import MovimentacaoPage from './pages/MovimentacaoPage.vue';
import AlertasPage from './pages/AlertasPage.vue';
import RelatoriosPage from './pages/RelatoriosPage.vue';
import ConfiguracoesPage from './pages/ConfiguracoesPage.vue';
import LoginPage from './pages/LoginPage.vue';

const isAuthenticated = ref(true);
const currentPage = ref('dashboard');
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

const handleLogin = () => {
  isAuthenticated.value = true;
  currentPage.value = 'dashboard';
};

const handleNavigate = (page: string) => {
  currentPage.value = page;
  isSidebarOpen.value = false;
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<template>
  <div>
    <Toaster 
      position="top-right" 
      :rich-colors="true" 
      :duration="3000"
      :theme="'light'"
    />
    
    <LoginPage v-if="!isAuthenticated" @login="handleLogin" />
    
    <div v-else class="min-h-screen bg-[#F8F9FA]">
      <Header @menu-click="toggleSidebar" user-name="Admin" />
      
      <Sidebar
        :is-open="isSidebarOpen"
        :current-page="currentPage"
        :is-collapsed="isSidebarCollapsed"
        @close="isSidebarOpen = false"
        @navigate="handleNavigate"
        @toggle-collapse="toggleSidebarCollapse"
      />
      
      <main 
        class="pt-24 pb-12 px-6 lg:px-8 transition-all duration-300"
        :class="isSidebarCollapsed ? 'lg:pl-28' : 'lg:pl-80'"
      >
        <div class="max-w-7xl mx-auto">
          <DashboardPage v-if="currentPage === 'dashboard'" @navigate="handleNavigate" />
          <CadastroPage v-else-if="currentPage === 'cadastro'" @navigate="handleNavigate" />
          <ListagemPage v-else-if="currentPage === 'listagem'" @navigate="handleNavigate" />
          <MovimentacaoPage v-else-if="currentPage === 'movimentacao'" @navigate="handleNavigate" />
          <AlertasPage v-else-if="currentPage === 'alertas'" @navigate="handleNavigate" />
          <RelatoriosPage v-else-if="currentPage === 'relatorios'" @navigate="handleNavigate" />
          <ConfiguracoesPage v-else-if="currentPage === 'configuracoes'" @navigate="handleNavigate" />
        </div>
      </main>
    </div>
  </div>
</template>
