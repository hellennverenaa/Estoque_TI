<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { 
  Users, UserPlus, Trash2, ShieldCheck, LogOut, Scan, UserCog, Edit2, Check, X, Timer, Save
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import Button from '../components/Button.vue';
import Badge from '../components/Badge.vue';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { settingsApi } from '../services/settingsApi';

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

const sessionDuration = ref(authStore.getSessionDuration());

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

const saveSessionDuration = () => {
  if (sessionDuration.value < 1) {
    toast.error('Duração inválida.');
    return;
  }
  authStore.setSessionDuration(sessionDuration.value);
  toast.success(`Duração da sessão global atualizada para ${sessionDuration.value} minutos.`);
};

// --- SETTINGS STORE CRUD ---
const settingsStore = useSettingsStore();

const newLocationName = ref('');
const editingLocationId = ref<string | null>(null);
const editingLocationName = ref('');

const newSectorName = ref('');
const editingSectorId = ref<string | null>(null);
const editingSectorName = ref('');

const handleAddLocation = async () => {
  if (!newLocationName.value || !adminRfid.value) return;
  try {
    await settingsApi.createLocation(newLocationName.value, adminRfid.value);
    toast.success('Local adicionado.');
    newLocationName.value = '';
    await settingsStore.fetchSettings();
  } catch (e: any) {
    toast.error(e.response?.data?.error || e.message);
  }
};
const startEditingLocation = (loc: any) => {
  editingLocationId.value = loc.id;
  editingLocationName.value = loc.name;
};
const saveEditingLocation = async (id: string) => {
  if (!adminRfid.value) return;
  try {
    await settingsApi.updateLocation(id, editingLocationName.value, adminRfid.value);
    toast.success('Local atualizado.');
    editingLocationId.value = null;
    await settingsStore.fetchSettings();
  } catch (e: any) {
    toast.error(e.response?.data?.error || e.message);
  }
};
const deleteLocation = async (id: string, name: string) => {
  if (!adminRfid.value) return;
  if (confirm(`Remover local "${name}"?`)) {
    try {
      await settingsApi.deleteLocation(id, adminRfid.value);
      toast.success('Local removido.');
      await settingsStore.fetchSettings();
    } catch (e: any) {
      toast.error(e.response?.data?.error || e.message);
    }
  }
};

const handleAddSector = async () => {
  if (!newSectorName.value || !adminRfid.value) return;
  try {
    await settingsApi.createSector(newSectorName.value, adminRfid.value);
    toast.success('Setor adicionado.');
    newSectorName.value = '';
    await settingsStore.fetchSettings();
  } catch (e: any) {
    toast.error(e.response?.data?.error || e.message);
  }
};
const startEditingSector = (sec: any) => {
  editingSectorId.value = sec.id;
  editingSectorName.value = sec.name;
};
const saveEditingSector = async (id: string) => {
  if (!adminRfid.value) return;
  try {
    await settingsApi.updateSector(id, editingSectorName.value, adminRfid.value);
    toast.success('Setor atualizado.');
    editingSectorId.value = null;
    await settingsStore.fetchSettings();
  } catch (e: any) {
    toast.error(e.response?.data?.error || e.message);
  }
};
const deleteSector = async (id: string, name: string) => {
  if (!adminRfid.value) return;
  if (confirm(`Remover setor "${name}"?`)) {
    try {
      await settingsApi.deleteSector(id, adminRfid.value);
      toast.success('Setor removido.');
      await settingsStore.fetchSettings();
    } catch (e: any) {
      toast.error(e.response?.data?.error || e.message);
    }
  }
};

// Foca no input ao carregar e inicializa a store
nextTick(() => {
  if (isLocked.value) adminAuthRef.value?.focus();
});

import { onMounted } from 'vue';
onMounted(async () => {
  await authStore.ensureLoaded();
  await settingsStore.ensureLoaded();
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
          <Card class="border-t-4 border-t-blue-500">
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

          <Card class="border-t-4 border-t-purple-500">
            <div class="flex items-center gap-2 mb-6">
              <Timer :size="22" class="text-purple-600" />
              <h3 class="font-bold text-gray-800 text-lg">Sessão Global</h3>
            </div>
            
            <div class="space-y-5">
              <Input 
                v-model.number="sessionDuration" 
                label="Duração em Minutos *" 
                placeholder="Ex: 5" 
                type="number"
                min="1"
              />

              <div class="pt-2">
                <Button full-width size="md" @click="saveSessionDuration" class="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-100">
                  <Save :size="18" class="mr-2" />
                  Salvar Tempo
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
                          class="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Editar permissão"
                        >
                          <Edit2 :size="18" />
                        </button>
                        <button 
                          @click="handleDeleteUser(user.id, user.username)"
                          class="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <!-- Locais de Armazenamento -->
        <Card class="border-t-4 border-t-green-500">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800 text-lg">Locais de Armazenamento</h3>
            <Badge variant="default">{{ settingsStore.locations?.length || 0 }}</Badge>
          </div>
          <div class="flex gap-2 mb-4">
            <Input v-model="newLocationName" placeholder="Novo local (Ex: Prateleira 1)" class="flex-1" @keyup.enter="handleAddLocation" />
            <Button @click="handleAddLocation" variant="primary">Adicionar</Button>
          </div>
          <div class="overflow-y-auto max-h-60 border border-gray-100 rounded-lg">
            <table class="w-full">
              <tbody class="divide-y divide-gray-100">
                <tr v-for="loc in settingsStore.locations" :key="loc.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2">
                    <Input v-if="editingLocationId === loc.id" v-model="editingLocationName" @keyup.enter="saveEditingLocation(loc.id)" class="w-full" />
                    <span v-else class="font-medium text-gray-700">{{ loc.name }}</span>
                  </td>
                  <td class="px-4 py-2 text-right w-24">
                    <div v-if="editingLocationId === loc.id" class="flex justify-end gap-1">
                      <button @click="saveEditingLocation(loc.id)" class="text-green-600 p-1"><Check :size="16" /></button>
                      <button @click="editingLocationId = null" class="text-gray-400 p-1"><X :size="16" /></button>
                    </div>
                    <div v-else class="flex justify-end gap-1">
                      <button @click="startEditingLocation(loc)" class="text-gray-400 hover:text-blue-600 p-1"><Edit2 :size="16" /></button>
                      <button @click="deleteLocation(loc.id, loc.name)" class="text-gray-400 hover:text-red-600 p-1"><Trash2 :size="16" /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <!-- Setores -->
        <Card class="border-t-4 border-t-orange-500">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-800 text-lg">Setores</h3>
            <Badge variant="default">{{ settingsStore.sectors?.length || 0 }}</Badge>
          </div>
          <div class="flex gap-2 mb-4">
            <Input v-model="newSectorName" placeholder="Novo setor (Ex: TI)" class="flex-1" @keyup.enter="handleAddSector" />
            <Button @click="handleAddSector" variant="primary">Adicionar</Button>
          </div>
          <div class="overflow-y-auto max-h-60 border border-gray-100 rounded-lg">
            <table class="w-full">
              <tbody class="divide-y divide-gray-100">
                <tr v-for="sec in settingsStore.sectors" :key="sec.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2">
                    <Input v-if="editingSectorId === sec.id" v-model="editingSectorName" @keyup.enter="saveEditingSector(sec.id)" class="w-full" />
                    <span v-else class="font-medium text-gray-700">{{ sec.name }}</span>
                  </td>
                  <td class="px-4 py-2 text-right w-24">
                    <div v-if="editingSectorId === sec.id" class="flex justify-end gap-1">
                      <button @click="saveEditingSector(sec.id)" class="text-green-600 p-1"><Check :size="16" /></button>
                      <button @click="editingSectorId = null" class="text-gray-400 p-1"><X :size="16" /></button>
                    </div>
                    <div v-else class="flex justify-end gap-1">
                      <button @click="startEditingSector(sec)" class="text-gray-400 hover:text-blue-600 p-1"><Edit2 :size="16" /></button>
                      <button @click="deleteSector(sec.id, sec.name)" class="text-gray-400 hover:text-red-600 p-1"><Trash2 :size="16" /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>