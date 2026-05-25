import type { Material } from '../stores/materialStore';
import type { Movimentacao } from '../stores/movimentacaoStore';

// Exportar para CSV
export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.toLowerCase().replace(/ /g, '')];
        return `"${value || ''}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exportar para Excel (formato HTML que o Excel reconhece)
export const exportToExcel = (data: any[], filename: string, headers: string[]) => {
  let html = '<table>';
  
  // Cabeçalho
  html += '<thead><tr>';
  headers.forEach(header => {
    html += `<th style="background-color: #2563EB; color: white; padding: 8px; border: 1px solid #ddd;">${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Corpo
  html += '<tbody>';
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      const key = header.toLowerCase().replace(/ /g, '');
      const value = row[key] || '';
      html += `<td style="padding: 8px; border: 1px solid #ddd;">${value}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exportar para PDF (usando jsPDF)
export const exportToPDF = async (data: any[], filename: string, title: string, headers: string[]) => {
  // Importação dinâmica do jsPDF
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175); // Azul primário
  doc.text(title, 14, 22);
  
  // Data de geração
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

  // Preparar dados para a tabela
  const tableData = data.map(row => 
    headers.map(header => {
      const key = header.toLowerCase().replace(/ /g, '');
      return row[key] || '';
    })
  );

  // Adicionar tabela
  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235], // Azul primário
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
    },
    margin: { top: 35 }
  });

  // Salvar PDF
  doc.save(`${filename}.pdf`);
};

// Preparar dados de materiais para exportação
export const prepareMaterialsData = (materials: Material[]) => {
  return materials.map(m => ({
    nome: m.name,
    categoria: m.category,
    codigo: m.codigo,
    quantidade: m.quantity,
    minimo: m.minimal_quantity,
    local: m.local_storage,
    fornecedor: m.fornecedor || '-',
    valor: m.value ? `R$ ${Number(m.value).toFixed(2)}` : '-',
    valortotal: m.value ? `R$ ${(m.quantity * Number(m.value)).toFixed(2)}` : '-',
    status: m.quantity === 0 ? 'SEM ESTOQUE' : m.quantity < m.minimal_quantity ? 'BAIXO' : 'OK'
  }));
};

// Preparar dados de movimentações para exportação
export const prepareMovimentacoesData = (movimentacoes: Movimentacao[]) => {
  return movimentacoes.map(m => ({
    data: new Date(m.data).toLocaleDateString('pt-BR'),
    tipo: m.tipo.toUpperCase(),
    material: m.materialNome,
    codigo: m.materialCodigo,
    categoria: m.categoria || '-',
    quantidade: m.quantidade,
    responsavel: m.responsavel,
    valor: m.valor ? `R$ ${m.valor.toFixed(2)}` : '-',
    observacoes: m.observacoes || '-'
  }));
};

// Gerar relatório completo de estoque
export const generateFullStockReport = (materials: Material[], movimentacoes: Movimentacao[]) => {
  const totalItens = materials.reduce((sum, m) => sum + m.quantity, 0);
  const valorTotal = materials.reduce((sum, m) => sum + (m.quantity * (Number(m.value) || 0)), 0);
  const abaixoDoMinimo = materials.filter(m => m.quantity < m.minimal_quantity).length;
  const semEstoque = materials.filter(m => m.quantity === 0).length;
  
  const totalEntradas = movimentacoes.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.quantidade, 0);
  const totalSaidas = movimentacoes.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.quantidade, 0);

  return {
    resumo: {
      totalItens,
      valorTotal,
      abaixoDoMinimo,
      semEstoque,
      totalCategorias: [...new Set(materials.map(m => m.category))].length,
      totalMateriais: materials.length
    },
    movimentacoes: {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas
    },
    materiais: materials,
    movimentacoesDetalhadas: movimentacoes
  };
};
