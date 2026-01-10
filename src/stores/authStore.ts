import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Usuario {
  id: string;
  nome: string;
  codigoCracha: string;
  cargo: string;
}

export const useAuthStore = defineStore('auth', () => {
  const usuarios = ref<Usuario[]>([
    { id: '1', nome: 'Hellen Verena', codigoCracha: '123456', cargo: 'Admin' },
    { id: '2', nome: 'Operador Estoque', codigoCracha: '999888', cargo: 'Operador' },
    { id: '3', nome: 'Suporte TI', codigoCracha: 'TI2024', cargo: 'Técnico' },
    { id: '4', nome: 'Meu Usuário', codigoCracha: '18783', cargo: 'Admin' }
  ]);

  const validarCracha = (codigo: string): Usuario | null => {
    if (!codigo) return null;
    const codigoLimpo = codigo.trim(); 
    return usuarios.value.find(u => u.codigoCracha === codigoLimpo) || null;
  };

  return { usuarios, validarCracha };
});