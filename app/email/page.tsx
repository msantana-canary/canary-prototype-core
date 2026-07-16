/**
 * Email Channel — Page
 *
 * Renders the Email surface (search + CTA row over the thread list / thread
 * view two-column body). The shell (sidebar + top bar) comes from layout.tsx.
 */

import React from 'react';
import { EmailSurface } from '@/components/products/email/EmailSurface';

export default function EmailPage() {
  return <EmailSurface />;
}
