export type LanguageValue =
  | 'en-US'
  | 'hi-IN'
  | 'es-ES'
  | 'fr-FR'
  | 'pt-BR'
  | 'de-DE'
  | 'ar-SA';

export type Language = {
  value: LanguageValue;
  label: string;
}
