import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userApi } from '../services/userApi';

export interface Usuario {
  id: string;
  username: string;
  matricula: number | string;
  rfid: number | string;
  role: string;
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
  const adicionarUsuario = async (matricula: number | string, role: string, adminRfid: number) => {
    loading.value = true;
    error.value = null;
    try {
      await userApi.create(matricula, role, adminRfid);
      await fetchAllowedUsers();
    } catch (e: any) {
      throw new Error(e.message || 'Erro ao adicionar usuário.');
    } finally {
      loading.value = false;
    }
  };

  const removerUsuario = async (id: string, adminRfid: number) => {
    loading.value = true;
    error.value = null;
    try {
      await userApi.delete(id, adminRfid);
      await fetchAllowedUsers();
    } catch (e: any) {
      throw new Error(e.message || 'Erro ao remover usuário.');
    } finally {
      loading.value = false;
    }
  };

  const atualizarPermissao = async (id: string, role: string, adminRfid: number) => {
    loading.value = true;
    error.value = null;
    try {
      await userApi.updateRole(id, role, adminRfid);
      await fetchAllowedUsers();
    } catch (e: any) {
      throw new Error(e.message || 'Erro ao atualizar permissão.');
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (usuarios.value) return;

    await fetchAllowedUsers();
  }

  const normalizar = (value: unknown) => String(value ?? '').trim();

  const validarCracha = (cracha: string | number): Usuario | null => {
    const codigo = normalizar(cracha);
    if (!codigo) return null;
    const list = usuarios.value ?? [];

    return (
      list.find(u => normalizar(u.rfid) === codigo) ??
      list.find(u => normalizar(u.matricula) === codigo) ??
      null
    );
  };

  return {
    ensureLoaded,
    fetchAllowedUsers,
    usuarios,
    validarCracha,
    adicionarUsuario,
    removerUsuario,
    atualizarPermissao
  };
});