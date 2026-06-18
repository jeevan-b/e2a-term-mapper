export function detectLanguage(value: string): 'as' | 'en' | 'all' { if (/[\u0980-\u09FF]/u.test(value)) return 'as'; if (/[A-Za-z]/.test(value)) return 'en'; return 'all'; }
