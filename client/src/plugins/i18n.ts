import { createI18n } from 'vue-i18n';

interface ModuleImportInterface {
  default: { [x: string]: string; };
}

export const SUPPORT_LOCALES: {
  value: string;
  label: string;
}[] = [];

function loadLocaleMessages () {
  const locales = import.meta.glob<string>('../locales/*.json', { eager: true });
  const localeEntries = Object.entries(locales);

  const messages: { [x: string]: { [x: string]: string; }; } = {};

  for (const [path, moduleImport] of localeEntries) {
    const lang = path.replace(/(\.\.\/locales\/|\.json)/g, '');
    messages[lang] = (moduleImport as unknown as ModuleImportInterface).default;

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
