<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { jsPDF } from 'jspdf'; // Importação direta
import autoTable from 'jspdf-autotable'; // Importação direta
import {
  FileText,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  FileSpreadsheet,
  Filter,
  X
} from 'lucide-vue-next';
import Card from '../components/Card.vue';
import Button from '../components/Button.vue';
import Input from '../components/Input.vue';
import Select from '../components/Select.vue';
import { useMaterialStore } from '../stores/materialStore';
import { useMovimentacaoStore } from '../stores/movimentacaoStore';
import { toast } from 'vue-sonner';

// ============================================
// STORES
// ============================================
const materialStore = useMaterialStore();
const movimentacaoStore = useMovimentacaoStore();

onMounted(() => {
  materialStore.ensureLoaded().catch(() => undefined);
  movimentacaoStore.ensureLoaded().catch(() => undefined);
});

// ============================================
// STATE - FILTROS
// ============================================
const filtros = reactive({
  dataInicio: '',
  dataFim: '',
  categoria: 'todas',
  tipo: 'todos'
});

// ============================================
// COMPUTED - OPÇÕES E DADOS
// ============================================
const opcoesCategoria = computed(() => {
  const categorias = [...new Set(materialStore.materials.map(m => m.categoria))];
  return [
    { value: 'todas', label: 'Todas as Categorias' },
    ...categorias.map(cat => ({ value: cat, label: cat }))
  ];
});

const opcoesTipo = [
  { value: 'todos', label: 'Todos os Tipos' },
  { value: 'entrada', label: 'Apenas Entradas' },
  { value: 'saida', label: 'Apenas Saídas' }
];

const estatisticasGerais = computed(() => {
  const totalItens = materialStore.materials.reduce((sum, m) => sum + m.quantidade, 0);
  const valorTotal = materialStore.materials.reduce((sum, m) => sum + (m.quantidade * (m.valor || 0)), 0);
  const totalMovimentacoes = movimentacaoStore.movimentacoes.length;
  return { totalItens, valorTotal, totalMovimentacoes };
});

const dadosFiltrados = computed(() => {
  let materiais = materialStore.materials;
  if (filtros.categoria !== 'todas') {
    materiais = materiais.filter(m => m.categoria === filtros.categoria);
  }

  let movimentacoes = [...movimentacaoStore.movimentacoes];
  if (filtros.dataInicio) movimentacoes = movimentacoes.filter(m => m.data >= filtros.dataInicio);
  if (filtros.dataFim) movimentacoes = movimentacoes.filter(m => m.data <= filtros.dataFim);
  if (filtros.tipo !== 'todos') movimentacoes = movimentacoes.filter(m => m.tipo === filtros.tipo);
  if (filtros.categoria !== 'todas') movimentacoes = movimentacoes.filter(m => m.categoria === filtros.categoria);

  return { materiais, movimentacoes };
});

const estatisticasFiltradas = computed(() => {
  const valorTotal = dadosFiltrados.value.materiais.reduce((sum, m) => sum + (m.quantidade * (m.valor || 0)), 0);
  const totalEntradas = dadosFiltrados.value.movimentacoes.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.quantidade, 0);
  const totalSaidas = dadosFiltrados.value.movimentacoes.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.quantidade, 0);
  return { valorTotal, totalEntradas, totalSaidas, saldo: totalEntradas - totalSaidas };
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const baixarArquivo = (conteudo: string, nomeArquivo: string, tipoMime: string) => {
  const blob = new Blob([conteudo], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const limparFiltros = () => {
  filtros.dataInicio = '';
  filtros.dataFim = '';
  filtros.categoria = 'todas';
  filtros.tipo = 'todos';
  toast.info('Filtros limpos');
};

const aplicarFiltros = () => toast.success('Filtros aplicados!');

// ============================================
// PREPARAÇÃO DE DADOS
// ============================================
const prepararDadosEstoque = () => dadosFiltrados.value.materiais.map(m => ({
  'Nome': m.nome, 'Categoria': m.categoria, 'Código': m.codigo,
  'Qtd': String(m.quantidade), 'Local': m.local || '-', 'Status': m.quantidade === 0 ? 'SEM ESTOQUE' : 'OK'
}));

const prepararDadosMovimentacoes = () => dadosFiltrados.value.movimentacoes.map(m => ({
  'Data': new Date(m.data).toLocaleDateString('pt-BR'), 'Tipo': m.tipo.toUpperCase(),
  'Material': m.materialNome, 'Qtd': String(m.quantidade), 'Resp': m.responsavel
}));

// ============================================
// EXPORTAÇÃO PDF (CORRIGIDA)
// ============================================
const exportarPDF = (dados: any[], nomeArquivo: string, titulo: string) => {
  if (dados.length === 0) {
    toast.error('Sem dados para exportar');
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text(titulo, 14, 22);
    
    // Data
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const headers = Object.keys(dados[0]);
    const body = dados.map(linha => headers.map(h => String(linha[h] || '')));

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`${nomeArquivo}.pdf`);
    toast.success('PDF baixado com sucesso!');
  } catch (erro) {
    console.error(erro);
    toast.error('Erro ao gerar PDF. Verifique o console.');
  }
};

const exportarCSV = (dados: any[], nomeArquivo: string) => {
  if (dados.length === 0) return;
  const headers = Object.keys(dados[0]);
  const csv = [headers.join(','), ...dados.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
  baixarArquivo('\uFEFF' + csv, `${nomeArquivo}.csv`, 'text/csv;charset=utf-8;');
};

const exportarExcel = (dados: any[], nomeArquivo: string) => {
  // Versão simplificada para Excel (HTML Table)
  exportarCSV(dados, nomeArquivo); // Reusa CSV por enquanto ou mantém a lógica HTML anterior
};

const exportarRelatorio = (tipo: string, formato: string) => {
  const hoje = new Date().toISOString().split('T')[0];
  let dados: any[] = [];
  let titulo = '';
  let nome = '';

  if (tipo === 'estoque') {
    dados = prepararDadosEstoque();
    titulo = 'Relatório de Estoque';
    nome = `Estoque_${hoje}`;
  } else if (tipo === 'movimentacoes') {
    dados = prepararDadosMovimentacoes();
    titulo = 'Relatório de Movimentações';
    nome = `Movimentacoes_${hoje}`;
  }

  if (formato === 'pdf') exportarPDF(dados, nome, titulo);
  else if (formato === 'csv') exportarCSV(dados, nome);
  else if (formato === 'excel') exportarExcel(dados, nome);
};
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-blue-800">Relatórios</h1>
      <p class="text-gray-500">Exporte os dados do sistema.</p>
    </div>

    <Card>
      <div class="flex items-center gap-2 mb-4">
        <Filter class="text-blue-600" />
        <h3 class="font-bold">Filtros</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input type="date" label="Início" v-model="filtros.dataInicio" />
        <Input type="date" label="Fim" v-model="filtros.dataFim" />
        <Select label="Categoria" v-model="filtros.categoria" :options="opcoesCategoria" />
        <div class="flex items-end gap-2">
          <Button @click="aplicarFiltros" class="flex-1">Aplicar</Button>
          <Button variant="secondary" @click="limparFiltros"><X :size="16"/></Button>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card class="border-t-4 border-blue-500">
        <div class="flex items-center gap-3 mb-4">
          <Package class="text-blue-600" :size="28" />
          <div>
            <h3 class="font-bold text-lg">Estoque Atual</h3>
            <p class="text-sm text-gray-500">{{ dadosFiltrados.materiais.length }} itens filtrados</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <Button variant="danger" @click="exportarRelatorio('estoque', 'pdf')"><FileText :size="16" class="mr-2"/>PDF</Button>
          <Button variant="secondary" @click="exportarRelatorio('estoque', 'csv')"><FileSpreadsheet :size="16" class="mr-2"/>CSV</Button>
          <Button variant="secondary" @click="exportarRelatorio('estoque', 'excel')"><Download :size="16" class="mr-2"/>XLS</Button>
        </div>
      </Card>

      <Card class="border-t-4 border-green-500">
        <div class="flex items-center gap-3 mb-4">
          <TrendingUp class="text-green-600" :size="28" />
          <div>
            <h3 class="font-bold text-lg">Movimentações</h3>
            <p class="text-sm text-gray-500">{{ dadosFiltrados.movimentacoes.length }} registros filtrados</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <Button variant="danger" @click="exportarRelatorio('movimentacoes', 'pdf')"><FileText :size="16" class="mr-2"/>PDF</Button>
          <Button variant="secondary" @click="exportarRelatorio('movimentacoes', 'csv')"><FileSpreadsheet :size="16" class="mr-2"/>CSV</Button>
          <Button variant="secondary" @click="exportarRelatorio('movimentacoes', 'excel')"><Download :size="16" class="mr-2"/>XLS</Button>
        </div>
      </Card>

    </div>
  </div>
</template>