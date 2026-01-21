import { createRouter, createWebHistory } from 'vue-router';

// Importação dos componentes das páginas
import DashboardPage from '../pages/DashboardPage.vue';
import CadastroPage from '../pages/CadastroPage.vue';
import ListagemPage from '../pages/ListagemPage.vue';
import MovimentacaoPage from '../pages/MovimentacaoPage.vue';
import AlertasPage from '../pages/AlertasPage.vue';
import RelatoriosPage from '../pages/RelatoriosPage.vue';
import ConfiguracoesPage from '../pages/ConfiguracoesPage.vue';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: DashboardPage },
  { path: '/cadastro', name: 'cadastro', component: CadastroPage },
  { path: '/listagem', name: 'listagem', component: ListagemPage },
  { path: '/movimentacao', name: 'movimentacao', component: MovimentacaoPage },
  { path: '/alertas', name: 'alertas', component: AlertasPage },
  { path: '/relatorios', name: 'relatorios', component: RelatoriosPage },
  { path: '/configuracoes', name: 'configuracoes', component: ConfiguracoesPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;