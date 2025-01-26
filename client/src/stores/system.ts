import { watch } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { i18n } from '@/plugins/i18n';
import useLocalStorage from '@/utils/useLocalStorage';

export type Locale = 'en-US' | 'zh-TW';

export const locales: Locale[] = ['en-US', 'zh-TW'];

export const useSystemStore = defineStore('system', {
  state: () => {
    const locale = useLocalStorage<Locale>('locale', 'en-US', 0);

    watch(locale, (value) => {
      i18n.global.locale.value = value;
    }, { immediate: true });

    return {
      locale,
    };
  },
  actions: {
    setLocale (locale: Locale) {
      this.locale = locale;
    },
  },
});


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSystemStore, import.meta.hot));
}