/**
 * Composer translation — the demo's canned language model.
 *
 * ⚠ THIS IS A FACSIMILE, and it is honest about being one. There is no
 * translation service behind the composer; production calls one at send time.
 * What this file provides is a DETERMINISTIC mapping from the handful of
 * phrases a demo actually types into five target languages, plus a plausible
 * fallback for anything else, so the preview never shows a spinner, never
 * shows the English back, and never shows the same string twice for two
 * different inputs.
 *
 * The fallback is intent-bucketed rather than random: a message containing
 * "thank" gets the target language's thank-you, a question mark gets its
 * "let me check and come right back", and everything else gets its "certainly,
 * we'll take care of it". That is enough for the preview to read as a real
 * translation of the SHAPE of what was typed, which is what the row is
 * demonstrating — that the agent can see the guest's copy before it goes.
 */

export type TranslateLanguage = 'es' | 'fr' | 'de' | 'ja' | 'pt';

export const TRANSLATE_LANGUAGES: { value: TranslateLanguage; label: string }[] = [
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'pt', label: 'Portuguese' },
];

/** The frame draws Japanese, so it is the default target. */
export const DEFAULT_TARGET: TranslateLanguage = 'ja';

/**
 * The ONE source language the composer reports. Production detects it from the
 * thread; the prototype has no detector, so the From select is seeded with
 * English and offers the same list as the target (an agent typing in Spanish to
 * a Japanese guest is a real case, and a locked source would have implied the
 * hotel only ever writes in English).
 */
export const SOURCE_LANGUAGES: { value: string; label: string }[] = [
  { value: 'en', label: 'English' },
  ...TRANSLATE_LANGUAGES,
];

type Phrasebook = Record<TranslateLanguage, string>;

/**
 * Keyed by the NORMALISED phrase — lowercased, punctuation stripped, runs of
 * whitespace collapsed — so "Hello there!" and "hello  there" hit the same row.
 * "Hello there" → "こんにちは" is the frame's own pair and is why it is first.
 */
const CANNED: Record<string, Phrasebook> = {
  'hello there': {
    es: 'Hola',
    fr: 'Bonjour',
    de: 'Hallo',
    ja: 'こんにちは',
    pt: 'Olá',
  },
  hello: { es: 'Hola', fr: 'Bonjour', de: 'Hallo', ja: 'こんにちは', pt: 'Olá' },
  hi: { es: 'Hola', fr: 'Bonjour', de: 'Hallo', ja: 'こんにちは', pt: 'Olá' },
  'good morning': {
    es: 'Buenos días',
    fr: 'Bonjour',
    de: 'Guten Morgen',
    ja: 'おはようございます',
    pt: 'Bom dia',
  },
  'thank you': {
    es: 'Gracias',
    fr: 'Merci',
    de: 'Danke',
    ja: 'ありがとうございます',
    pt: 'Obrigado',
  },
  'your room is ready': {
    es: 'Su habitación está lista.',
    fr: 'Votre chambre est prête.',
    de: 'Ihr Zimmer ist bereit.',
    ja: 'お部屋のご用意ができました。',
    pt: 'O seu quarto está pronto.',
  },
  'we will send someone up right away': {
    es: 'Enviaremos a alguien de inmediato.',
    fr: 'Nous envoyons quelqu’un tout de suite.',
    de: 'Wir schicken sofort jemanden hoch.',
    ja: 'すぐに担当者を向かわせます。',
    pt: 'Vamos enviar alguém imediatamente.',
  },
  'how can we help': {
    es: '¿En qué podemos ayudarle?',
    fr: 'Comment pouvons-nous vous aider ?',
    de: 'Wie können wir Ihnen helfen?',
    ja: 'どのようなご用件でしょうか。',
    pt: 'Como podemos ajudar?',
  },
};

/** Intent fallbacks — one per bucket per language. */
const FALLBACK: Record<'thanks' | 'apology' | 'question' | 'default', Phrasebook> = {
  thanks: {
    es: '¡Muchas gracias! Estamos encantados de ayudarle.',
    fr: 'Merci beaucoup ! Nous sommes ravis de vous aider.',
    de: 'Vielen Dank! Wir helfen Ihnen gerne.',
    ja: 'ありがとうございます。お役に立てて光栄です。',
    pt: 'Muito obrigado! Ficamos felizes em ajudar.',
  },
  apology: {
    es: 'Lamentamos las molestias. Lo resolveremos de inmediato.',
    fr: 'Nous sommes désolés pour la gêne occasionnée. Nous réglons cela tout de suite.',
    de: 'Wir entschuldigen uns für die Unannehmlichkeiten und kümmern uns sofort darum.',
    ja: 'ご不便をおかけし申し訳ございません。すぐに対応いたします。',
    pt: 'Pedimos desculpa pelo incómodo. Vamos resolver já.',
  },
  question: {
    es: 'Con gusto lo consulto y le confirmo enseguida.',
    fr: 'Je vérifie et je reviens vers vous tout de suite.',
    de: 'Ich prüfe das und melde mich gleich bei Ihnen.',
    ja: '確認のうえ、すぐにご連絡いたします。',
    pt: 'Vou confirmar e respondo já de seguida.',
  },
  default: {
    es: 'Por supuesto, nos ocupamos de ello enseguida.',
    fr: 'Bien sûr, nous nous en occupons tout de suite.',
    de: 'Selbstverständlich, wir kümmern uns sofort darum.',
    ja: 'かしこまりました。すぐに対応いたします。',
    pt: 'Com certeza, tratamos disso já.',
  },
};

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The preview string for one composer draft.
 *
 * Returns `null` for an empty draft — the frame shows the selects alone until
 * there is something to translate, and a chip containing nothing would read as
 * a failed call.
 */
export function translatePreview(text: string, target: TranslateLanguage): string | null {
  const key = normalise(text);
  if (!key) return null;

  const canned = CANNED[key];
  if (canned) return canned[target];

  if (/\bthank/.test(key)) return FALLBACK.thanks[target];
  if (/\b(sorry|apolog)/.test(key)) return FALLBACK.apology[target];
  if (text.includes('?')) return FALLBACK.question[target];
  return FALLBACK.default[target];
}
