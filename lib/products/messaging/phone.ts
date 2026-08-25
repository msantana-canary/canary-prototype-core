/**
 * ONE PHONE FORMATTER FOR THE WHOLE SURFACE (QA-2, 2026-08-25).
 *
 * ── WHY ───────────────────────────────────────────────────────────────────
 * A phone-only thread had TWO registers for one concept, side by side in the
 * same list: a fixture thread titled `+12125550000` and, one row above it, a
 * thread the user had just created titled `4155559876` — the exact keystrokes,
 * echoed back. Neither was hotelier-readable, and the Calls product's own mock
 * data already uses the parenthesised form, so the inconsistency reached across
 * products too.
 *
 * ── THE RULE ──────────────────────────────────────────────────────────────
 * Display only. `contactNumber` keeps whatever it was stored as; the store's
 * `phoneKey` still compares DIGITS, so identity is untouched and formatting
 * cannot fork a thread or fail a match. This is a rendering choice applied at
 * the last possible moment, which is why it lives in one function rather than
 * in the data.
 *
 * ⚠ IT REFUSES RATHER THAN GUESSES. Ten digits, or eleven beginning with a US
 * country code, become `(201) 555-0123`. Anything else — a short number, an
 * international one, a string with letters in it — comes back BYTE-IDENTICAL.
 * A formatter that reshapes what it does not understand turns a number a
 * hotelier could still dial into one they cannot, and this surface can be fed
 * arbitrary text through the compose field.
 *
 * The `+1` is dropped for the US case on purpose: it is the only country the
 * demo property serves, and `(201) 555-0123` is the register the frames and
 * the `CanaryInputPhone` placeholder both draw.
 */

/** Digits only — the identity view. Mirrors `phoneKey` in the store. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * A hotelier-readable phone number, or the input unchanged.
 *
 * `formatPhoneForDisplay('4155559876')`  → `'(415) 555-9876'`
 * `formatPhoneForDisplay('+12125550000')` → `'(212) 555-0000'`
 * `formatPhoneForDisplay('+44 20 7946 0958')` → unchanged
 * `formatPhoneForDisplay('banana')` → unchanged
 */
export function formatPhoneForDisplay(value: string | undefined | null): string {
  if (!value) return '';
  const digits = digitsOf(value);
  const national =
    digits.length === 10 ? digits : digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : null;
  if (!national) return value;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

/**
 * Is this plausibly a number this product could message?
 *
 * The SAME ten-digit test `createThreadFromPhone` and `ComposeHeader` already
 * apply, stated once so the compose gate, the new-group gate and the create
 * can never drift apart. Deliberately loose about SHAPE and strict about
 * substance: parentheses, dashes, spaces and a leading `+` are all fine, and
 * anything carrying a letter is not — which is the actual failure mode the QA
 * found ("banana" landing in a saved group's contact table).
 */
export function isPlausiblePhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  // E.164-ish: an optional +, then digits and the usual human separators.
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return false;
  const digits = digitsOf(trimmed);
  return digits.length >= 10 && digits.length <= 15;
}
