import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * NO DEV BADGE ON STAGE (QA-3, 2026-08-25).
   *
   * The SJ demo is driven off `next dev`, not a production build, so Next's dev
   * indicator — the pill bottom-left that turns into a red "1 Issue" the moment
   * anything logs an error — is rendered ON the surface being demoed. An
   * intermittent hydration mismatch was painting exactly that (root-caused and
   * fixed in `broadcast-mock-data.ts`), and one bad frame is enough: the badge
   * persists for the rest of the session and a reload is the only way out.
   *
   * ⚠ THIS IS A BELT, NOT THE FIX. Turning the indicator off does not make an
   * error go away, it makes it invisible — which is the right trade for a
   * facsimile someone is presenting from, and the wrong one for everything
   * else. Errors still reach the browser console, and that is where to look.
   */
  devIndicators: false,
};

export default nextConfig;
