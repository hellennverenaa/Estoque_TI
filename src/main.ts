import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';
import router from './router'; // <--- Importar o router
import App from './App.vue';
import './styles/globals.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router); // <--- Usar o router
app.use(MotionPlugin);

app.mount('#app');