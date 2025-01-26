import { createI18n } from 'vue-i18n';

export const SUPPORT_LOCALES: {
  value: string;
  label: string;
}[] = [];

function loadLocaleMessages () {
  const locales = import.meta.glob('../locales/*.json', { eager: true }) as { [x: string]: any };
  const messages: { [x: string]: { [x: string]: string; }; } = {};

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in locales) {
    const lang = key.replace(/(\.\.\/locales\/|\.json)/g, '');

    messages[lang] = locales[key].default;
    SUPPORT_LOCALES.push({ value: lang, label: messages[lang].language });
  }

  return messages;
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'zh-TW',
  allowComposition: true,
  messages: loadLocaleMessages(),
});
