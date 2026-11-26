// Supported languages with BCP-47 locales for Web Speech API
export const LANGUAGES = [
  { code: 'en', label: 'English', locale: 'en-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', locale: 'kn-IN' },
  { code: 'hi', label: 'हिंदी (Hindi)', locale: 'hi-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', locale: 'ta-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', locale: 'te-IN' },
  { code: 'mr', label: 'मराठी (Marathi)', locale: 'mr-IN' },
  { code: 'es', label: 'Español (Spanish)', locale: 'es-ES' },
  { code: 'fr', label: 'Français (French)', locale: 'fr-FR' },
  { code: 'de', label: 'Deutsch (German)', locale: 'de-DE' },
  { code: 'ja', label: '日本語 (Japanese)', locale: 'ja-JP' },
  { code: 'ar', label: 'العربية (Arabic)', locale: 'ar-SA', rtl: true },
]

export const DEFAULT_LANGUAGE = LANGUAGES[0]

export function getLanguageByCode(code) {
  return LANGUAGES.find((l) => l.code === code) ?? DEFAULT_LANGUAGE
}
