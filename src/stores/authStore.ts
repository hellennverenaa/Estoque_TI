import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { userApi } from '../services/userApi';

export interface Usuario {
  id: string;
  username: string;
  matricula: number | string;
  rfid: number | string;
}

export const useAuthStore = defineStore('auth', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const usuarios = ref<Usuario[]>();

  const fetchAllowedUsers = async (): Promise<Usuario[]> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userApi.list() as Usuario[];
      usuarios.value = response;

      return response;
    } catch (error: any) {
      error.value = error.message || 'Erro ao carregar usuários.';
      throw error;
    }
    finally {
      loading.value = false;
    }
  };

  // Ações de Gerenciamento
  // const adicionarUsuario = (usuario: Omit<Usuario, 'id'>) => {
  //   if (usuarios.value.some(u => u.codigoCracha === usuario.codigoCracha)) {
  //     throw new Error('Este código de crachá já está em uso!');
  //   }

  //   usuarios.value.push({
  //     id: Date.now().toString(), // ID único baseado no tempo
  //     ...usuario
  //   });
  // };

  // const removerUsuario = (id: string) => {
  //   const user = usuarios.value.find(u => u.id === id);
  //   // Impede deletar o último Admin para não trancar o sistema
  //   if (user?.cargo === 'Admin' && usuarios.value.filter(u => u.cargo === 'Admin').length <= 1) {
  //     throw new Error('Segurança: Não é possível remover o único Administrador do sistema.');
  //   }
  //   usuarios.value = usuarios.value.filter(u => u.id !== id);
  // };

  const ensureLoaded = async () => {
    if (usuarios.value) return;

    await fetchAllowedUsers();
  }

  return {
    ensureLoaded,
    fetchAllowedUsers,
    usuarios,
    // validarCracha,
    // adicionarUsuario,
    // removerUsuario
  };
});