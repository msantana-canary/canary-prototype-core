import { redirect } from 'next/navigation';

/**
 * Settings Landing Page
 *
 * Redirects to Guest Journey (the first/default settings page).
 */
export default function SettingsPage() {
  redirect('/settings/guest-journey');
}
