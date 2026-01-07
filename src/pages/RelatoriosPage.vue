<template>
  <div class="relatorios-page">
    <!-- Header -->
    <header class="page-header">
      <h1 class="page-title">Relatórios e Exportação</h1>
      <p class="page-subtitle">Gere relatórios completos e exporte em múltiplos formatos</p>
    </header>

    <!-- Resumo Geral -->
    <Card variant="info">
      <template #default>
        <div class="card-header">
          <div class="icon-wrapper bg-blue">
            <TrendingUp :size="24" class="text-white" />
          </div>
          <div>
            <h3 class="card-title">Resumo Geral do Sistema</h3>
            <p class="card-description">Dados consolidados de todo o estoque</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-label">Total de Itens</p>
            <p class="stat-value">{{ estatisticasGerais.totalItens }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Valor Total</p>
            <p class="stat-value-money">{{ formatarMoeda(estatisticasGerais.valorTotal) }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Movimentações</p>
            <p class="stat-value">{{ estatisticasGerais.totalMovimentacoes }}</p>
          </div>
        </div>
      </template>
    </Card>

    <!-- Filtros Avançados -->
    <Card>
      <template #default>
        <div class="card-header">
          <div class="icon-wrapper bg-blue-light">
            <Filter :size="24" class="text-blue" />
          </div>
          <div>
            <h3 class="card-title">Filtros Avançados</h3>
            <p class="card-description">Configure os parâmetros dos relatórios</p>
          </div>
        </div>

        <!-- Campos de Filtro -->
        <div class="filters-grid">
          <Input
            v-model="filtros.dataInicio"
            type="date"
            label="Data Início"
          />
          
          <Input
            v-model="filtros.dataFim"
            type="date"
            label="Data Fim"
          />

          <Select
            v-model="filtros.categoria"
            label="Categoria"
            :options="opcoesCategoria"
          />

          <Select
            v-model="filtros.tipo"
            label="Tipo de Movimentação"
            :options="opcoesTipo"
          />
        </div>

        <!-- Atalhos de Período -->
        <div class="shortcuts-section">
          <p class="shortcuts-label">Atalhos de Período:</p>
          <div class="shortcuts-buttons">
            <Button
              v-for="atalho in atalhosDePerido"
              :key="atalho.label"
              variant="secondary"
              size="sm"
              @click="atalho.action"
            >
              {{ atalho.label }}
            </Button>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="action-buttons">
          <Button @click="aplicarFiltros">
            <Filter :size="16" />
            Aplicar Filtros
          </Button>
          
          <Button variant="ghost" @click="limparFiltros">
            <X :size="16" />
            Limpar Filtros
          </Button>
        </div>

        <!-- Contador de Resultados -->
        <div class="results-counter">
          <p class="results-label">Resultados com filtros aplicados:</p>
          <div class="results-stats">
            <div class="result-item">
              <Package :size="18" class="text-blue" />
              <span class="result-number">{{ dadosFiltrados.materiais.length }}</span>
              <span class="result-text">materiais</span>
            </div>
            <div class="result-divider"></div>
            <div class="result-item">
              <TrendingUp :size="18" class="text-green" />
              <span class="result-number">{{ dadosFiltrados.movimentacoes.length }}</span>
              <span class="result-text">movimentações</span>
            </div>
            <div class="result-divider"></div>
            <div class="result-item">
              <DollarSign :size="18" class="text-purple" />
              <span class="result-number">{{ formatarMoeda(estatisticasFiltradas.valorTotal) }}</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Relatório 1: Estoque -->
    <Card>
      <template #default>
        <div class="card-header">
          <div class="icon-wrapper bg-blue-light">
            <Package :size="24" class="text-blue" />
          </div>
          <div>
            <h3 class="card-title">1. Relatório de Estoque Completo</h3>
            <p class="card-description">{{ dadosFiltrados.materiais.length }} materiais</p>
          </div>
        </div>

        <div class="export-buttons">
          <Button
            variant="danger"
            full-width
            @click="exportarRelatorio('estoque', 'pdf')"
          >
            <FileText :size="16" />
            Exportar PDF
          </Button>
          <Button
            variant="secondary"
            full-width
            @click="exportarRelatorio('estoque', 'csv')"
          >
            <FileSpreadsheet :size="16" />
            Exportar CSV
          </Button>
          <Button
            variant="secondary"
            full-width
            @click="exportarRelatorio('estoque', 'excel')"
          >
            <Download :size="16" />
            Exportar Excel
          </Button>
        </div>
      </template>
    </Card>

    <!-- Relatório 2: Movimentações -->
    <Card>
      <template #default>
        <div class="card-header">
          <div class="icon-wrapper bg-green-light">
            <TrendingUp :size="24" class="text-green" />
          </div>
          <div>
            <h3 class="card-title">2. Relatório de Movimentações</h3>
            <p class="card-description">{{ dadosFiltrados.movimentacoes.length }} registros</p>
          </div>
        </div>

        <!-- Estatísticas de Movimentações -->
        <div class="movement-stats">
          <div class="movement-stat">
            <p class="movement-label">Entradas</p>
            <p class="movement-value text-green">+{{ estatisticasFiltradas.totalEntradas }}</p>
          </div>
          <div class="movement-stat">
            <p class="movement-label">Saídas</p>
            <p class="movement-value text-red">-{{ estatisticasFiltradas.totalSaidas }}</p>
          </div>
          <div class="movement-stat">
            <p class="movement-label">Saldo</p>
            <p class="movement-value text-blue">{{ estatisticasFiltradas.saldo }}</p>
          </div>
        </div>

        <div class="export-buttons">
          <Button
            variant="danger"
            full-width
            @click="exportarRelatorio('movimentacoes', 'pdf')"
          >
            <FileText :size="16" />
            Exportar PDF
          </Button>
          <Button
            variant="secondary"
            full-width
            @click="exportarRelatorio('movimentacoes', 'csv')"
          >
            <FileSpreadsheet :size="16" />
            Exportar CSV
          </Button>
          <Button
            variant="secondary"
            full-width
            @click="exportarRelatorio('movimentacoes', 'excel')"
          >
            <Download :size="16" />
            Exportar Excel
          </Button>
        </div>
      </template>
    </Card>

    <!-- Relatório 3: Financeiro -->
    <Card>
      <template #default>
        <div class="card-header">
          <div class="icon-wrapper bg-purple-light">
            <DollarSign :size="24" class="text-purple" />
          </div>
          <div>
            <h3 class="card-title">3. Relatório Financeiro</h3>
            <p class="card-description">{{ formatarMoeda(estatisticasFiltradas.valorTotal) }}</p>
          </div>
        </div>

        <div class="export-buttons">
          <Button
            variant="danger"
            full-width
            @click="exportarRelatorio('financeiro', 'pdf')"
          >
            <FileText :size="16" />
            Exportar PDF
          </Button>
          <Button
            variant="secondary"
            full-width
            @click="exportarRelatorio('financeiro', 'csv')"
          >
            <FileSpreadsheet :size="16" />
            Exportar CSV
          </Button>
          <Button
            variant="secondary"
            full-width
            @click="exportarRelatorio('financeiro', 'excel')"
          >
            <Download :size="16" />
            Exportar Excel
          </Button>
        </div>
      </template>
    </Card>

    <!-- Relatório 4: Completo -->
    <Card class="card-complete">
      <template #default>
        <div class="card-header">
          <div class="icon-wrapper bg-gradient">
            <FileText :size="24" class="text-white" />
          </div>
          <div>
            <h3 class="card-title">4. Relatório Completo do Sistema</h3>
            <p class="card-description">Consolidação de todos os dados</p>
          </div>
        </div>

        <div class="export-buttons">
          <Button
            variant="primary"
            full-width
            @click="exportarRelatorio('completo', 'pdf')"
          >
            <FileText :size="16" />
            Baixar PDF
          </Button>
          <Button
            variant="primary"
            full-width
            @click="exportarRelatorio('completo', 'csv')"
          >
            <FileSpreadsheet :size="16" />
            Baixar CSV
          </Button>
          <Button
            variant="primary"
            full-width
            @click="exportarRelatorio('completo', 'excel')"
          >
            <Download :size="16" />
            Baixar Excel
          </Button>
        </div>
      </template>
    </Card>

    <!-- Dicas -->
    <Card variant="info">
      <template #default>
        <div class="tips-section">
          <div class="tips-icon">💡</div>
          <div>
            <h4 class="tips-title">Dicas para usar os relatórios:</h4>
            <ul class="tips-list">
              <li>Use os atalhos de período para filtrar rapidamente</li>
              <li>Combine múltiplos filtros para análises específicas</li>
              <li>CSV e Excel funcionam direto no navegador</li>
              <li>PDF requer: npm install jspdf jspdf-autotable</li>
              <li>Os números atualizam automaticamente ao mudar os filtros</li>
            </ul>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
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
// COMPUTED - OPÇÕES DE FILTRO
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

// ============================================
// COMPUTED - ESTATÍSTICAS GERAIS
// ============================================
const estatisticasGerais = computed(() => {
  const totalItens = materialStore.materials.reduce((sum, m) => sum + m.quantidade, 0);
  const valorTotal = materialStore.materials.reduce((sum, m) => sum + (m.quantidade * (m.valor || 0)), 0);
  const totalMovimentacoes = movimentacaoStore.movimentacoes.length;

  return { totalItens, valorTotal, totalMovimentacoes };
});

// ============================================
// COMPUTED - DADOS FILTRADOS
// ============================================
const dadosFiltrados = computed(() => {
  // Filtrar materiais
  let materiais = materialStore.materials;
  if (filtros.categoria !== 'todas') {
    materiais = materiais.filter(m => m.categoria === filtros.categoria);
  }

  // Filtrar movimentações
  let movimentacoes = [...movimentacaoStore.movimentacoes];
  
  if (filtros.dataInicio) {
    movimentacoes = movimentacoes.filter(m => m.data >= filtros.dataInicio);
  }
  
  if (filtros.dataFim) {
    movimentacoes = movimentacoes.filter(m => m.data <= filtros.dataFim);
  }
  
  if (filtros.tipo !== 'todos') {
    movimentacoes = movimentacoes.filter(m => m.tipo === filtros.tipo);
  }
  
  if (filtros.categoria !== 'todas') {
    movimentacoes = movimentacoes.filter(m => m.categoria === filtros.categoria);
  }

  return { materiais, movimentacoes };
});

// ============================================
// COMPUTED - ESTATÍSTICAS FILTRADAS
// ============================================
const estatisticasFiltradas = computed(() => {
  const valorTotal = dadosFiltrados.value.materiais.reduce(
    (sum, m) => sum + (m.quantidade * (m.valor || 0)), 
    0
  );

  const totalEntradas = dadosFiltrados.value.movimentacoes
    .filter(m => m.tipo === 'entrada')
    .reduce((sum, m) => sum + m.quantidade, 0);

  const totalSaidas = dadosFiltrados.value.movimentacoes
    .filter(m => m.tipo === 'saida')
    .reduce((sum, m) => sum + m.quantidade, 0);

  const saldo = totalEntradas - totalSaidas;

  return { valorTotal, totalEntradas, totalSaidas, saldo };
});

// ============================================
// ATALHOS DE PERÍODO
// ============================================
const atalhosDePerido = [
  {
    label: 'Últimos 7 dias',
    action: () => definirPeriodo(7)
  },
  {
    label: 'Últimos 30 dias',
    action: () => definirPeriodo(30)
  },
  {
    label: 'Últimos 90 dias',
    action: () => definirPeriodo(90)
  },
  {
    label: 'Mês Atual',
    action: () => definirMesAtual()
  }
];

// ============================================
// FUNÇÕES - FILTROS
// ============================================
const definirPeriodo = (dias: number) => {
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - dias);
  
  filtros.dataInicio = inicio.toISOString().split('T')[0];
  filtros.dataFim = hoje.toISOString().split('T')[0];
  
  toast.success(`✓ Período de ${dias} dias selecionado`);
};

const definirMesAtual = () => {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  filtros.dataInicio = primeiroDia.toISOString().split('T')[0];
  filtros.dataFim = hoje.toISOString().split('T')[0];
  
  toast.success('✓ Mês atual selecionado');
};

const limparFiltros = () => {
  filtros.dataInicio = '';
  filtros.dataFim = '';
  filtros.categoria = 'todas';
  filtros.tipo = 'todos';
  
  toast.info('✓ Filtros limpos');
};

const aplicarFiltros = () => {
  const totalMateriais = dadosFiltrados.value.materiais.length;
  const totalMovimentacoes = dadosFiltrados.value.movimentacoes.length;
  
  toast.success('✓ Filtros aplicados!', {
    description: `${totalMateriais} materiais • ${totalMovimentacoes} movimentações`
  });
};

// ============================================
// FUNÇÕES - UTILIDADES
// ============================================
const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const baixarArquivo = (conteudo: string, nomeArquivo: string, tipoMime: string) => {
  const blob = new Blob([conteudo], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================
// FUNÇÕES - PREPARAR DADOS PARA EXPORTAÇÃO
// ============================================
const prepararDadosEstoque = () => {
  return dadosFiltrados.value.materiais.map(m => ({
    'Nome': m.nome,
    'Categoria': m.categoria,
    'Código': m.codigo,
    'Quantidade': m.quantidade,
    'Mínimo': m.minimo,
    'Local': m.local,
    'Fornecedor': m.fornecedor || '-',
    'Valor': m.valor ? formatarMoeda(m.valor) : '-',
    'Status': m.quantidade === 0 ? 'SEM ESTOQUE' : m.quantidade < m.minimo ? 'BAIXO' : 'OK'
  }));
};

const prepararDadosMovimentacoes = () => {
  return dadosFiltrados.value.movimentacoes.map(m => ({
    'Data': new Date(m.data).toLocaleDateString('pt-BR'),
    'Tipo': m.tipo.toUpperCase(),
    'Material': m.materialNome,
    'Código': m.materialCodigo,
    'Categoria': m.categoria || '-',
    'Quantidade': m.quantidade,
    'Responsável': m.responsavel,
    'Valor': m.valor ? formatarMoeda(m.valor) : '-'
  }));
};

const prepararDadosFinanceiro = () => {
  return dadosFiltrados.value.materiais.map(m => ({
    'Categoria': m.categoria,
    'Nome': m.nome,
    'Quantidade': m.quantidade,
    'Valor Unitário': m.valor ? formatarMoeda(m.valor) : '-',
    'Valor Total': m.valor ? formatarMoeda(m.quantidade * m.valor) : '-'
  }));
};

const prepararDadosCompleto = () => {
  return [
    { 'Seção': '══════ RESUMO GERAL ══════', 'Valor': '' },
    { 'Seção': 'Total de Itens no Estoque', 'Valor': estatisticasGerais.value.totalItens },
    { 'Seção': 'Valor Total do Estoque', 'Valor': formatarMoeda(estatisticasGerais.value.valorTotal) },
    { 'Seção': 'Total de Movimentações', 'Valor': estatisticasGerais.value.totalMovimentacoes },
    { 'Seção': '', 'Valor': '' },
    { 'Seção': '══════ DADOS FILTRADOS ══════', 'Valor': '' },
    { 'Seção': 'Materiais Filtrados', 'Valor': dadosFiltrados.value.materiais.length },
    { 'Seção': 'Movimentações Filtradas', 'Valor': dadosFiltrados.value.movimentacoes.length },
    { 'Seção': 'Valor Total Filtrado', 'Valor': formatarMoeda(estatisticasFiltradas.value.valorTotal) },
    { 'Seção': '', 'Valor': '' },
    { 'Seção': '══════ MOVIMENTAÇÕES ══════', 'Valor': '' },
    { 'Seção': 'Total de Entradas', 'Valor': estatisticasFiltradas.value.totalEntradas },
    { 'Seção': 'Total de Saídas', 'Valor': estatisticasFiltradas.value.totalSaidas },
    { 'Seção': 'Saldo (Entradas - Saídas)', 'Valor': estatisticasFiltradas.value.saldo }
  ];
};

// ============================================
// FUNÇÕES - EXPORTAÇÃO CSV
// ============================================
const exportarCSV = (dados: any[], nomeArquivo: string) => {
  if (dados.length === 0) {
    toast.error('Nenhum dado para exportar');
    return;
  }

  try {
    toast.info('Gerando CSV...');
    
    const headers = Object.keys(dados[0]);
    const linhas = dados.map(linha => 
      headers.map(header => `"${linha[header] || ''}"`).join(',')
    );
    
    const csv = [headers.join(','), ...linhas].join('\n');
    const csvComBOM = '\uFEFF' + csv;
    
    baixarArquivo(csvComBOM, `${nomeArquivo}.csv`, 'text/csv;charset=utf-8;');
    toast.success('✓ CSV exportado com sucesso!');
  } catch (erro) {
    console.error('Erro ao exportar CSV:', erro);
    toast.error('Erro ao exportar CSV');
  }
};

// ============================================
// FUNÇÕES - EXPORTAÇÃO EXCEL
// ============================================
const exportarExcel = (dados: any[], nomeArquivo: string) => {
  if (dados.length === 0) {
    toast.error('Nenhum dado para exportar');
    return;
  }

  try {
    toast.info('Gerando Excel...');
    
    const headers = Object.keys(dados[0]);
    
    let html = '<table>';
    html += '<thead><tr>';
    headers.forEach(header => {
      html += `<th style="background:#2563EB;color:white;padding:8px;border:1px solid #ddd;font-weight:bold;">${header}</th>`;
    });
    html += '</tr></thead>';
    
    html += '<tbody>';
    dados.forEach(linha => {
      html += '<tr>';
      headers.forEach(header => {
        html += `<td style="padding:8px;border:1px solid #ddd;">${linha[header] || ''}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    baixarArquivo(html, `${nomeArquivo}.xls`, 'application/vnd.ms-excel');
    toast.success('✓ Excel exportado com sucesso!');
  } catch (erro) {
    console.error('Erro ao exportar Excel:', erro);
    toast.error('Erro ao exportar Excel');
  }
};

// ============================================
// FUNÇÕES - EXPORTAÇÃO PDF
// ============================================
const exportarPDF = async (dados: any[], nomeArquivo: string, titulo: string) => {
  if (dados.length === 0) {
    toast.error('Nenhum dado para exportar');
    return;
  }

  try {
    toast.info('Gerando PDF...');
    
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text(titulo, 14, 22);
    
    // Data de geração
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    // Preparar tabela
    const headers = Object.keys(dados[0]);
    const body = dados.map(linha => headers.map(header => String(linha[header] || '')));

    // Adicionar tabela
    (doc as any).autoTable({
      head: [headers],
      body: body,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: 50
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });

    doc.save(`${nomeArquivo}.pdf`);
    toast.success('✓ PDF exportado com sucesso!');
  } catch (erro) {
    console.error('Erro ao exportar PDF:', erro);
    toast.error('Erro ao exportar PDF. Instale: npm install jspdf jspdf-autotable');
  }
};

// ============================================
// FUNÇÃO PRINCIPAL - EXPORTAR RELATÓRIO
// ============================================
const exportarRelatorio = (tipo: string, formato: string) => {
  const dataAtual = new Date().toISOString().split('T')[0];
  
  let dados: any[] = [];
  let nomeArquivo = '';
  let titulo = '';

  switch (tipo) {
    case 'estoque':
      dados = prepararDadosEstoque();
      nomeArquivo = `Estoque_${dataAtual}`;
      titulo = 'Relatório de Estoque Completo';
      break;
    
    case 'movimentacoes':
      dados = prepararDadosMovimentacoes();
      nomeArquivo = `Movimentacoes_${dataAtual}`;
      titulo = 'Relatório de Movimentações';
      break;
    
    case 'financeiro':
      dados = prepararDadosFinanceiro();
      nomeArquivo = `Financeiro_${dataAtual}`;
      titulo = 'Relatório Financeiro';
      break;
    
    case 'completo':
      dados = prepararDadosCompleto();
      nomeArquivo = `Completo_${dataAtual}`;
      titulo = 'Relatório Completo do Sistema';
      break;
  }

  switch (formato) {
    case 'csv':
      exportarCSV(dados, nomeArquivo);
      break;
    case 'excel':
      exportarExcel(dados, nomeArquivo);
      break;
    case 'pdf':
      exportarPDF(dados, nomeArquivo, titulo);
      break;
  }
};
</script>

<style scoped>
.relatorios-page {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  background: linear-gradient(to right, #1E40AF, #2563EB);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: #6B7280;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue {
  background-color: #2563EB;
}

.bg-blue-light {
  background-color: #EFF6FF;
}

.bg-green-light {
  background-color: #ECFDF5;
}

.bg-purple-light {
  background-color: #F5F3FF;
}

.bg-gradient {
  background: linear-gradient(to bottom right, #2563EB, #8B5CF6);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.text-white {
  color: white;
}

.text-blue {
  color: #2563EB;
}

.text-green {
  color: #10B981;
}

.text-red {
  color: #EF4444;
}

.text-purple {
  color: #8B5CF6;
}

.card-title {
  font-weight: 600;
  color: #111827;
}

.card-description {
  font-size: 14px;
  color: #6B7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-card {
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #111827;
}

.stat-value-money {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.shortcuts-section {
  margin-bottom: 24px;
}

.shortcuts-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 12px;
}

.shortcuts-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.results-counter {
  padding: 20px;
  background: linear-gradient(to right, #EFF6FF, #F8F9FA);
  border-radius: 12px;
  border: 2px solid #DBEAFE;
}

.results-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 8px;
}

.results-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-number {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.result-text {
  font-size: 14px;
  color: #6B7280;
}

.result-divider {
  width: 1px;
  height: 24px;
  background-color: #E5E7EB;
}

.export-buttons {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .export-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

.movement-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background-color: #F8F9FA;
  border-radius: 12px;
  margin-bottom: 24px;
}

.movement-stat {
  text-align: center;
}

.movement-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 4px;
}

.movement-value {
  font-size: 24px;
  font-weight: 700;
}

.card-complete {
  background: linear-gradient(to bottom right, #EFF6FF, #F5F3FF);
  border: 2px solid rgba(37, 99, 235, 0.2);
}

.tips-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.tips-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(37, 99, 235, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.tips-title {
  font-weight: 600;
  color: #1E40AF;
  margin-bottom: 8px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tips-list li {
  font-size: 14px;
  color: rgba(30, 64, 175, 0.9);
}

.tips-list li::before {
  content: '•';
  color: #2563EB;
  font-weight: bold;
  margin-right: 8px;
}
</style>
