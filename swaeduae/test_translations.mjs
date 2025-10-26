import { translations } from './lib/i18n/translations.js';

console.log('Translations loaded successfully');
console.log('English keys:', Object.keys(translations.en).length);
console.log('Arabic keys:', Object.keys(translations.ar).length);
console.log('Has attendance in English:', 'attendance' in translations.en);
console.log('Has attendance in Arabic:', 'attendance' in translations.ar);
