<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router"; // Importar router
import { Toaster } from "vue-sonner";
// @ts-ignore
import 'vue-sonner/style.css'
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import LoginPage from "./pages/LoginPage.vue";
import { useAuthStore } from "./stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => !!authStore.currentUser);
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
let sessionInterval: any;

onMounted(() => {
  if (authStore.currentUser && !authStore.checkSession()) {
    router.push('/dashboard');
  }
  
  sessionInterval = setInterval(() => {
    if (authStore.currentUser) {
      if (!authStore.checkSession()) {
        router.push('/dashboard');
      }
    }
  }, 10000);
});

onUnmounted(() => {
  clearInterval(sessionInterval);
});

const handleLogin = () => {
  router.push("/dashboard"); // Redireciona ao logar
};

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};

// Funções do menu
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<template>
  <div>
    <Toaster position="top-right" :rich-colors="true" :duration="3000" :theme="'light'" />

    <LoginPage v-if="!isAuthenticated" @login="handleLogin" />

    <div v-else class="min-h-screen bg-[#F8F9FA]">
      <Header @menu-click="toggleSidebar" @logout="handleLogout" :user-name="authStore.currentUser?.username || 'Usuário'" />

      <Sidebar
        :is-open="isSidebarOpen"
        :is-collapsed="isSidebarCollapsed"
        @close="isSidebarOpen = false"
        @toggle-collapse="toggleSidebarCollapse"
      />

      <main
        class="pt-24 pb-12 px-6 transition-all duration-300 lg:ml-[80px]"
      >
        <div class="max-w-7xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
