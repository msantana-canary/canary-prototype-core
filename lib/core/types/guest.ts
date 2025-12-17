/**
 * Canonical Guest Type
 *
 * This represents a hotel guest across all products.
 * The same guest should appear consistently in Messaging, Check-in, Checkout, etc.
 */

export interface StatusTag {
  label: string;      // e.g., "DIAMOND ELITE"
  color: string;      // Background color, e.g., "#000000"
  textColor?: string; // Text color, e.g., "white"
}

export interface Guest {
  id: string;                    // Unique identifier, e.g., "guest-emily"
  name: string;                  // Full name
  initials: string;              // e.g., "ES" for Emily Smith
  avatar?: string;               // Optional URL to profile image
  phone?: string;                // e.g., "+15005550012"
  email?: string;                // e.g., "emily.smith@gmail.com"
  preferredLanguage?: string;    // e.g., "English"
  statusTag?: StatusTag;         // Loyalty tier
}
