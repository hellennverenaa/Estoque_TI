import router from './router';
import App from './App.vue';
import './styles/globals.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App);
const pinia = createPinia();
  
app.use(pinia);
app.use(router);
app.use(MotionPlugin);
app.use(vuetify);

app.mount('#app');