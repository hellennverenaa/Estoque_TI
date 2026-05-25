<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { 
  Users, UserPlus, Trash2, ShieldCheck, LogOut, Scan, UserCog, Edit2, Check, X
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Button from '../components/Button.vue';
import Badge from '../components/Badge.vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

// --- ESTADOS ---
const isLocked = ref(true); // Começa bloqueado
const adminAuthInput = ref('');
const adminAuthRef = ref<HTMLInputElement | null>(null);
const adminRfid = ref<number | null>(null);

const newUser = ref({
  matricula: '',
  role: 'operator'
});

const editingUserId = ref<string | null>(null);
const editingRole = ref<string>('operator');

const cargosOptions = [
  { value: 'admin_master', label: 'Admin Geral (Acesso Total)' },
  { value: 'admin', label: 'Admin (Gerencia Sistema)' },
  { value: 'operator', label: 'Operador (Movimentação)' },
  { value: 'intern', label: 'Estagiário (Movimentação com restrições)' }
];

// --- AÇÕES ---

const verificarAdmin = () => {
  const usuario = authStore.validarCracha(adminAuthInput.value);
  
  if (usuario) {
    if (usuario.role === 'admin' || usuario.role === 'admin_master') {
      isLocked.value = false;
      adminRfid.value = Number(usuario.rfid);
      toast.success(`Acesso liberado: ${usuario.username}`);
      adminAuthInput.value = '';
    } else {
      toast.error('Acesso negado: Nível de administrador exigido.');
      adminAuthInput.value = '';
      adminAuthRef.value?.focus();
    }
  } else {
    toast.error('Crachá desconhecido.');
    adminAuthInput.value = '';
    adminAuthRef.value?.focus();
  }
};

const sairModoAdmin = () => {
  isLocked.value = true;
  adminRfid.value = null;
  toast.info('Sessão encerrada.');
};

const handleAddUser = async () => {
  if (!newUser.value.matricula) {
    toast.error('Preencha a matrícula obrigatória.');
    return;
  }
  if (!adminRfid.value) return;

  try {
    await authStore.adicionarUsuario(newUser.value.matricula, newUser.value.role, adminRfid.value);
    toast.success('Usuário cadastrado com sucesso!');
    newUser.value = { matricula: '', role: 'operator' }; // Limpa form
  } catch (e: any) {
    toast.error(e.message);
  }
};

const handleDeleteUser = async (id: string, nome: string) => {
  if (!adminRfid.value) return;
  
  if (confirm(`Tem certeza que deseja remover "${nome}"?`)) {
    try {
      await authStore.removerUsuario(id, adminRfid.value);
      toast.success('Usuário removido.');
    } catch (e: any) {
      toast.error(e.message);
    }
  }
};

const startEditing = (user: any) => {
  editingUserId.value = user.id;
  editingRole.value = user.role;
};

const cancelEditing = () => {
  editingUserId.value = null;
};

const saveEditing = async (id: string) => {
  if (!adminRfid.value) return;
  try {
    await authStore.atualizarPermissao(id, editingRole.value, adminRfid.value);
    toast.success('Permissão atualizada.');
    editingUserId.value = null;
  } catch (e: any) {
    toast.error(e.message);
  }
};

// Foca no input ao carregar e inicializa a store
nextTick(() => {
  if (isLocked.value) adminAuthRef.value?.focus();
});

import { onMounted } from 'vue';
onMounted(async () => {
  await authStore.ensureLoaded();
});
</script>

<template>
  <div class="relative min-h-[600px]">
    
    <div v-if="isLocked" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
      <div class="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-100">
        <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-blue-50">
          <ShieldCheck :size="48" class="text-blue-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Configurações Protegidas</h2>
        <p class="text-gray-500 mb-8 px-4">Esta área permite gerenciar usuários e acessos. Identifique-se como <strong class="text-blue-600">Admin</strong> para continuar.</p>
        
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Scan :size="20" class="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            ref="adminAuthRef"
            v-model="adminAuthInput"
            @keyup.enter="verificarAdmin"
            type="password"
            class="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-center font-bold tracking-widest text-lg placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400"
            placeholder="Bipe seu crachá de Admin..."
            autocomplete="off"
          />
        </div>
        <p class="text-xs text-gray-400 mt-4">Pressione Enter após a leitura se não for automático</p>
      </div>
    </div>

    <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <UserCog :size="28" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Gestão de Acessos</h1>
            <p class="text-sm text-gray-500">Adicione ou remova permissões de uso do sistema.</p>
          </div>
        </div>
        <Button variant="secondary" @click="sairModoAdmin" class="shrink-0">
          <LogOut :size="18" class="mr-2" /> 
          Sair do Modo Admin
        </Button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div class="lg:col-span-4 space-y-6">
          <Card class="border-t-4 border-t-blue-500 h-full">
            <div class="flex items-center gap-2 mb-6">
              <UserPlus :size="22" class="text-blue-600" />
              <h3 class="font-bold text-gray-800 text-lg">Adicionar Usuário</h3>
            </div>
            
            <div class="space-y-5">
              <Input 
                v-model="newUser.matricula" 
                label="Matrícula ou RFID *" 
                placeholder="Ex: 12345 ou 2269219895" 
                type="number"
              />

              <Select 
                v-model="newUser.role" 
                label="Permissão *" 
                :options="cargosOptions"
              />

              <div class="pt-2">
                <Button full-width size="lg" @click="handleAddUser" class="shadow-lg shadow-blue-100">
                  <UserPlus :size="18" class="mr-2" />
                  Cadastrar
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div class="lg:col-span-8">
          <Card class="h-full">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <Users :size="22" class="text-gray-600" />
                <h3 class="font-bold text-gray-800 text-lg">Usuários Cadastrados</h3>
              </div>
              <Badge variant="default">{{ authStore.usuarios?.length || 0 }} ativos</Badge>
            </div>

            <div class="overflow-x-auto rounded-xl border border-gray-200">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Crachá</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissão</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="user in (authStore.usuarios || [])" :key="user.id" class="hover:bg-blue-50/50 transition-colors group">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                          {{ user.username.charAt(0).toUpperCase() }}
                        </div>
                        <span class="font-medium text-gray-900">{{ user.username }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <code class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono border border-gray-200">{{ user.rfid }}</code>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <template v-if="editingUserId === user.id">
                        <Select 
                          v-model="editingRole" 
                          :options="cargosOptions"
                        />
                      </template>
                      <template v-else>
                        <Badge variant="success" class="shadow-sm">
                          {{ cargosOptions.find(c => c.value === user.role)?.label?.split(' ')[0] || user.role }}
                        </Badge>
                      </template>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div v-if="editingUserId === user.id" class="flex justify-end gap-2">
                        <button 
                          @click="saveEditing(user.id)"
                          class="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all"
                          title="Salvar"
                        >
                          <Check :size="18" />
                        </button>
                        <button 
                          @click="cancelEditing"
                          class="text-gray-400 hover:bg-gray-50 p-2 rounded-lg transition-all"
                          title="Cancelar"
                        >
                          <X :size="18" />
                        </button>
                      </div>
                      <div v-else class="flex justify-end gap-2">
                        <button 
                          @click="startEditing(user)"
                          class="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Editar permissão"
                        >
                          <Edit2 :size="18" />
                        </button>
                        <button 
                          @click="handleDeleteUser(user.id, user.username)"
                          class="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remover usuário"
                        >
                          <Trash2 :size="18" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p class="text-xs text-gray-400 mt-4 text-center">
              * Todos os usuários listados têm acesso ao sistema usando seus crachás.
            </p>
          </Card>
        </div>

      </div>
    </div>
  </div>
</template>