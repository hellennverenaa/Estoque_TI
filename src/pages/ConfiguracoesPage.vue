<script setup lang="ts">
import { ref } from 'vue';
import { Save, User, Bell, Shield } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Card from '../components/Card.vue';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';

const userData = ref({
  nome: 'Administrador',
  email: 'admin@estoque.com',
  telefone: '(11) 99999-9999',
});

const notificacoes = ref({
  email: true,
  estoqueMinimo: true,
  movimentacoes: false,
});

const handleSave = () => {
  toast.success('Configurações salvas com sucesso!');
};
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="space-y-3">
      <h1 class="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] bg-clip-text text-transparent">
        Configurações
      </h1>
      <p class="text-[#6B7280]">Gerencie suas preferências e informações do sistema</p>
    </div>

    <!-- Dados do Usuário -->
    <Card>
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
          <User :size="24" class="text-[#2563EB]" />
        </div>
        <div>
          <h3 class="font-semibold text-[#111827]">Dados do Usuário</h3>
          <p class="text-sm text-[#6B7280]">Atualize suas informações pessoais</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          v-model="userData.nome"
          label="Nome Completo"
          placeholder="Seu nome"
        />

        <Input
          v-model="userData.email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
        />

        <Input
          v-model="userData.telefone"
          label="Telefone"
          placeholder="(00) 00000-0000"
        />
      </div>
    </Card>

    <!-- Notificações -->
    <Card>
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
          <Bell :size="24" class="text-[#10B981]" />
        </div>
        <div>
          <h3 class="font-semibold text-[#111827]">Notificações</h3>
          <p class="text-sm text-[#6B7280]">Configure suas preferências de notificação</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
          <div>
            <p class="font-medium text-[#111827]">Notificações por E-mail</p>
            <p class="text-sm text-[#6B7280]">Receba alertas importantes por e-mail</p>
          </div>
          <input
            v-model="notificacoes.email"
            type="checkbox"
            class="w-5 h-5 text-[#2563EB] rounded"
          />
        </div>

        <div class="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
          <div>
            <p class="font-medium text-[#111827]">Alertas de Estoque Mínimo</p>
            <p class="text-sm text-[#6B7280]">Avise quando itens atingirem o estoque mínimo</p>
          </div>
          <input
            v-model="notificacoes.estoqueMinimo"
            type="checkbox"
            class="w-5 h-5 text-[#2563EB] rounded"
          />
        </div>

        <div class="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
          <div>
            <p class="font-medium text-[#111827]">Relatório de Movimentações</p>
            <p class="text-sm text-[#6B7280]">Receba resumo semanal de movimentações</p>
          </div>
          <input
            v-model="notificacoes.movimentacoes"
            type="checkbox"
            class="w-5 h-5 text-[#2563EB] rounded"
          />
        </div>
      </div>
    </Card>

    <!-- Segurança -->
    <Card>
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 bg-[#FEF2F2] rounded-xl flex items-center justify-center">
          <Shield :size="24" class="text-[#EF4444]" />
        </div>
        <div>
          <h3 class="font-semibold text-[#111827]">Segurança</h3>
          <p class="text-sm text-[#6B7280]">Proteja sua conta</p>
        </div>
      </div>

      <div class="space-y-4">
        <Button variant="secondary" full-width>
          Alterar Senha
        </Button>
        <Button variant="secondary" full-width>
          Autenticação em Dois Fatores
        </Button>
      </div>
    </Card>

    <!-- Salvar -->
    <Card class="bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6] border-2 border-dashed border-[#E5E7EB]">
      <div class="flex justify-end">
        <Button @click="handleSave">
          <Save :size="16" />
          Salvar Configurações
        </Button>
      </div>
    </Card>
  </div>
</template>
