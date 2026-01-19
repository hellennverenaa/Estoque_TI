import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface Usuario {
  id: string;
  nome: string;
  codigoCracha: string;
  cargo: 'Admin' | 'Técnico' | 'Operador';
}

export const useAuthStore = defineStore('auth', () => {
  // 1. Carrega usuários salvos ou cria o padrão
  const loadFromStorage = (): Usuario[] => {
    const saved = localStorage.getItem('estoque_users');
    if (saved) {
      return JSON.parse(saved);
    }
    // Lista inicial OBRIGATÓRIA (Se não tiver nada salvo)
    return [
      { id: '1', nome: 'Admin Inicial', codigoCracha: '123456', cargo: 'Admin' }, // Use este crachá para entrar
      { id: '3', nome: 'Hendrius', codigoCracha: '3020495', cargo: 'Admin' },
      { id: '1', nome: 'Admin', codigoCracha: '18783', cargo: 'Admin' },
      { id: '2', nome: 'Operador Teste', codigoCracha: '999888', cargo: 'Operador' }
    ];
  };

  const usuarios = ref<Usuario[]>(loadFromStorage());

  // 2. Salva automaticamente qualquer mudança no navegador
  watch(usuarios, (newVal) => {
    localStorage.setItem('estoque_users', JSON.stringify(newVal));
  }, { deep: true });

  // Validação de login
  const validarCracha = (codigo: string): Usuario | null => {
    if (!codigo) return null;
    const cleanCode = codigo.trim();
    return usuarios.value.find(u => u.codigoCracha === cleanCode) || null;
  };

  // Ações de Gerenciamento
  const adicionarUsuario = (usuario: Omit<Usuario, 'id'>) => {
    if (usuarios.value.some(u => u.codigoCracha === usuario.codigoCracha)) {
      throw new Error('Este código de crachá já está em uso!');
    }
    
    usuarios.value.push({
      id: Date.now().toString(), // ID único baseado no tempo
      ...usuario
    });
  };

  const removerUsuario = (id: string) => {
    const user = usuarios.value.find(u => u.id === id);
    // Impede deletar o último Admin para não trancar o sistema
    if (user?.cargo === 'Admin' && usuarios.value.filter(u => u.cargo === 'Admin').length <= 1) {
      throw new Error('Segurança: Não é possível remover o único Administrador do sistema.');
    }
    usuarios.value = usuarios.value.filter(u => u.id !== id);
  };

  return {
    usuarios,
    validarCracha,
    adicionarUsuario,
    removerUsuario
  };
});