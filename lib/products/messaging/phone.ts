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

/** Digits only — the raw view, before the country code is reasoned about. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * The US national ten digits, or `null` for anything this file refuses to
 * interpret. The single place the `+1` equivalence is decided.
 */
function usNationalDigits(value: string): string | null {
  const digits = digitsOf(value);
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return null;
}

/**
 * IDENTITY. Two strings that return the same key are the same conversation.
 *
 * ⚠ THE STORE USED TO OWN A SECOND COPY OF THIS (QA-3, 2026-08-25). It compared
 * raw digits, so `5005550013` and `+15005550013` were different numbers to the
 * dedup and the same number to the formatter directly above — and the most
 * natural way a US hotelier types a number forked a second, guest-less thread
 * beside the named one, rendered in the same polished register as a real row.
 * Two normalizers cannot disagree if there is only one, so the store imports
 * this rather than restating it, and the comment at the top of this file
 * ("formatting cannot fork a thread or fail a match") is now true.
 *
 * Non-US input is keyed on its digits unchanged: the formatter refuses rather
 * than guesses, and identity refuses in exactly the same places.
 */
export function phoneIdentity(value: string): string {
  return usNationalDigits(value) ?? digitsOf(value);
}

/** How many digits the user has actually typed, for the compose-gate's ≥10 test. */
export function phoneDigitCount(value: string): number {
  return digitsOf(value).length;
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
  const national = usNationalDigits(value);
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
