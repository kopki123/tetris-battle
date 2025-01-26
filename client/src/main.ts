import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';
import './style.css';
import App from './App.vue';
import router from './router';
import { i18n } from './plugins/i18n';

async function main () {
  const app = createApp(App);
  const pinia = createPinia();

  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
  });

  app.use(pinia);
  app.use(router);
  app.use(i18n);
  app.use(vuetify);
  app.mount('#app');
}

main();
