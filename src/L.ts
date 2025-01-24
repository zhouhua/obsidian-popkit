import { loadAllLocales } from '../i18n/i18n-util.sync';
import { i18n } from '../i18n/i18n-util';
import type { Locales } from '../i18n/i18n-types';

loadAllLocales();

declare global {
  interface Window {
    i18next: {
      language: string;
    };
  }
}

let locale: Locales = 'en';
try {
  locale = (window.i18next.language || '').startsWith('zh') ? 'zh' : 'en';
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
catch (e) {
  /* empty */
}

const L = i18n()[locale];

export default L;
