'use client';

/**
 * PhonePreview
 *
 * Realistic phone preview of what the guest receives.
 * Images served from /public/images/ — no external hosting, no expiration.
 * Updates live as the user types in the editor.
 */

import Icon from '@mdi/react';
import { mdiAccount, mdiDotsHorizontal } from '@mdi/js';
import { GuestJourneyMessage, Channel } from '@/lib/products/guest-journey/types';

interface PhonePreviewProps {
  message: GuestJourneyMessage | null | undefined;
  activeChannel: Channel;
}

const HOTEL_NAME = 'The Statler';
const HOTEL_ADDRESS = '1914 Commerce St, Dallas, TX 75201';
const HOTEL_PHONE = '+1 (214) 261-2000';
const CTA_COLOR = '#2858C4'; // Hotel brand color for CTA button

function resolveTags(text: string): string {
  return text
    .replace(/\{\{guest_first_name\}\}/g, 'Emily')
    .replace(/\{\{guest_last_name\}\}/g, 'Johnson')
    .replace(/\{\{guest_formal_name\}\}/g, 'Ms. Johnson')
    .replace(/\{\{guest_full_name\}\}/g, 'Emily Johnson')
    .replace(/\{\{hotel_name(\|safe)?\}\}/g, HOTEL_NAME)
    .replace(/\{\{arrival_date\}\}/g, 'March 20, 2026')
    .replace(/\{\{departure_date\}\}/g, 'March 24, 2026')
    .replace(/\{\{confirmation_id\}\}/g, 'GH-82947')
    .replace(/\{\{room_type\}\}/g, 'Deluxe King')
    .replace(/\{\{guest_email\}\}/g, 'emily@example.com')
    .replace(/\{\{hotel_phone\}\}/g, HOTEL_PHONE)
    .replace(/\{\{room_number\}\}/g, '412')
    .replace(/\{\{reservation_amount\}\}/g, '$1,250.00')
    .replace(/\{\{guest_loyalty\}\}/g, 'Gold')
    .replace(/\{\{kiosk_qr_lookup_image\}\}/g, '[QR Code]')
    .replace(/\{\{unsubscribe_link\}\}/g, 'Unsubscribe');
}

// Render body, replacing {{guest_url_button}} with a styled CTA button
function renderEmailBody(text: string) {
  const resolved = resolveTags(text);

  // Check for CTA placeholder
  if (!resolved.includes('[Check In Now]')) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{resolved}</span>;
  }

  const parts = resolved.split('[Check In Now]');
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part && <span style={{ whiteSpace: 'pre-wrap' }}>{part}</span>}
          {i < parts.length - 1 && (
            <div style={{ margin: '12px 0' }}>
              <div
                style={{
                  backgroundColor: CTA_COLOR,
                  color: '#FFF',
                  padding: '8px 20px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: 'var(--font-open-sans), Open Sans, Helvetica, Arial, sans-serif',
                }}
              >
                Check in now
              </div>
            </div>
          )}
        </span>
      ))}
    </>
  );
}

/* ── Email Preview ──────────────────────────────────────────────── */

function EmailPreview({ subject, body }: { subject: string; body: string }) {
  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FFF' }}>
      {/* Status bar */}
      <img
        src="/images/preview/status-bar.png"
        alt=""
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />

      {/* Hotel logo header */}
      <div style={{ padding: '16px 16px 12px', textAlign: 'center' }}>
        <img
          src="/images/hotel-logo.png"
          alt={HOTEL_NAME}
          style={{ maxWidth: 120, height: 'auto', margin: '0 auto' }}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 2, backgroundColor: '#f7f3f3', margin: '0 16px' }} />

      {/* Headline (from subject) */}
      <div style={{ padding: '14px 16px 4px', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#101112',
            margin: 0,
            lineHeight: '1.3',
            fontFamily: 'var(--font-open-sans), Open Sans, Helvetica, Arial, sans-serif',
          }}
        >
          {resolveTags(subject) || 'Message Preview'}
        </h2>
      </div>

      {/* CTA Button (static, always present for check-in type emails) */}
      <div style={{ padding: '8px 16px 12px' }}>
        <div
          style={{
            backgroundColor: CTA_COLOR,
            color: '#FFF',
            padding: '8px 20px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            textAlign: 'center',
            fontFamily: 'var(--font-open-sans), Open Sans, Helvetica, Arial, sans-serif',
          }}
        >
          Check in now
        </div>
      </div>

      {/* Hotel property image */}
      <div style={{ padding: '0 16px 12px' }}>
        <img
          src="/images/hotel-property.png"
          alt={HOTEL_NAME}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 4,
            display: 'block',
          }}
        />
      </div>

      {/* Body text — renders actual editor content with resolved merge tags */}
      <div
        style={{
          padding: '8px 16px 16px',
          fontSize: 13,
          lineHeight: '1.6',
          color: '#1e1e1e',
          fontFamily: 'var(--font-open-sans), Open Sans, Helvetica, Arial, sans-serif',
        }}
      >
        {renderEmailBody(body)}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f7f3f3',
          textAlign: 'center',
          fontSize: 8,
          color: '#555',
          lineHeight: '1.5',
          fontFamily: 'var(--font-open-sans), Open Sans, Helvetica, Arial, sans-serif',
        }}
      >
        <div>{HOTEL_NAME} | {HOTEL_ADDRESS}</div>
        <div>{HOTEL_PHONE}</div>
        <div style={{ marginTop: 6 }}>
          Powered by Canary Technologies ·{' '}
          <span style={{ textDecoration: 'underline' }}>Unsubscribe</span> ·{' '}
          <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}

/* ── SMS Preview — static images for header/input, dynamic bubble ── */

function SmsPreview({ body }: { body: string }) {
  const resolved = resolveTags(body);
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FFF' }}>
      {/* Static header image */}
      <img
        src="/images/preview/sms-header.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />

      {/* Message area */}
      <div className="flex-1 overflow-auto" style={{ padding: '12px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: '#8E8E93' }}>Today 9:41 AM</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 4 }}>
          <div
            style={{
              backgroundColor: '#E9E9EB',
              borderRadius: '18px 18px 18px 4px',
              padding: '8px 12px',
              maxWidth: '82%',
              minWidth: 60,
              minHeight: 20,
              fontSize: 12,
              lineHeight: '1.45',
              color: resolved ? '#000' : '#8E8E93',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {resolved || 'Your message here...'}
          </div>
        </div>
        <div style={{ fontSize: 9, color: '#8E8E93', paddingLeft: 4, marginTop: 2 }}>
          Delivered
        </div>
      </div>

      {/* Static input bar image */}
      <img
        src="/images/preview/sms-input.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />
    </div>
  );
}

/* ── WhatsApp Preview — static images for chrome, dynamic bubble ── */

function WhatsAppPreview({ body }: { body: string }) {
  const resolved = resolveTags(body);
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#E5DDD5' }}>
      {/* Static header image */}
      <img
        src="/images/preview/wa-header.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />

      {/* Chat area with WhatsApp background pattern */}
      <div
        className="flex-1 overflow-auto"
        style={{
          backgroundImage: 'url(/images/preview/wa-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '8px 10px',
        }}
      >
        {/* Date indicator */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <img
            src="/images/preview/wa-date.png"
            alt="Today"
            style={{ height: 20, display: 'inline-block' }}
          />
        </div>

        {/* Message bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 4 }}>
          <div
            style={{
              backgroundColor: '#FFF',
              borderRadius: '0 8px 8px 8px',
              padding: '6px 8px 2px',
              maxWidth: '85%',
              minWidth: 60,
              minHeight: 20,
              fontSize: 12,
              lineHeight: '1.45',
              color: resolved ? '#111B21' : '#667781',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
            }}
          >
            {resolved || 'Your message here...'}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 3,
                marginTop: 2,
                paddingBottom: 2,
              }}
            >
              <span style={{ fontSize: 9, color: '#667781' }}>9:41 AM</span>
              <span style={{ fontSize: 10, color: '#53BDEB' }}>✓✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Static input bar image */}
      <img
        src="/images/preview/wa-input.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />
    </div>
  );
}

/* ── Booking.com Preview — chat bubble style matching Figma ── */

function BookingPreview({ body }: { body: string }) {
  const resolved = resolveTags(body);
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FFF' }}>
      {/* Static header image */}
      <img
        src="/images/preview/booking-header.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />

      {/* Chat area */}
      <div className="flex-1 overflow-auto" style={{ padding: '12px 12px' }}>
        {/* Date chip */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: '#6B6B6B' }}>Today, 5:41 PM</span>
        </div>

        {/* Message row: avatar + bubble + 3-dot menu */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#C4C4C4',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              marginTop: 2,
            }}
          >
            <Icon path={mdiAccount} size={0.6} color="#FFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                backgroundColor: '#E7E7E7',
                borderRadius: '0 12px 12px 12px',
                padding: '10px 12px',
                maxWidth: 220,
                fontSize: 12,
                lineHeight: '1.5',
                color: resolved ? '#1a1a1a' : '#999',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {resolved || 'Your message here...'}
            </div>
            <div style={{ fontSize: 10, color: '#6B6B6B', marginTop: 4, paddingLeft: 2 }}>
              8:32 AM
            </div>
          </div>
          <div style={{ flexShrink: 0, marginTop: 6 }}>
            <Icon path={mdiDotsHorizontal} size={0.7} color="#12347B" />
          </div>
        </div>
      </div>

      {/* Static input bar image */}
      <img
        src="/images/preview/booking-input.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />
    </div>
  );
}

/* ── Expedia Preview — chat bubble style matching Figma ── */

function ExpediaPreview({ body }: { body: string }) {
  const resolved = resolveTags(body);
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FFF' }}>
      {/* Static header image */}
      <img
        src="/images/preview/expedia-header.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />

      {/* Chat area */}
      <div className="flex-1 overflow-auto" style={{ padding: '12px 12px' }}>
        {/* Message row: avatar + bubble */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#3E5D9A',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              marginTop: 2,
            }}
          >
            <Icon path={mdiAccount} size={0.6} color="#FFF" />
          </div>
          <div>
            <div
              style={{
                backgroundColor: '#F7F5F4',
                borderRadius: '0 12px 12px 12px',
                padding: '10px 12px',
                maxWidth: 220,
                fontSize: 12,
                lineHeight: '1.5',
                color: resolved ? '#1a1a1a' : '#999',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {resolved || 'Your message here...'}
            </div>
            <div style={{ fontSize: 10, color: '#6B6B6B', marginTop: 4, paddingLeft: 2 }}>
              8:32 AM
            </div>
          </div>
        </div>
      </div>

      {/* Static input bar image */}
      <img
        src="/images/preview/expedia-input.png"
        alt=""
        style={{ width: '100%', height: 'auto', flexShrink: 0, display: 'block' }}
      />
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */

export function PhonePreview({ message, activeChannel }: PhonePreviewProps) {
  const channelContent = message?.channels.find((c) => c.channel === activeChannel);
  const body = channelContent?.body || '';
  const subject = channelContent?.subject || '';
  const hasContent = body.length > 0;

  return (
    <div
      style={{
        width: 320,
        height: 660,
        backgroundColor: '#FFF',
        borderRadius: 32,
        boxShadow: '0 6px 12px rgba(0,0,0,0.16)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Channel content — always show chrome, placeholder when no content */}
      {activeChannel === 'email' && <EmailPreview subject={subject} body={body} />}
      {activeChannel === 'sms' && <SmsPreview body={body} />}
      {activeChannel === 'whatsapp' && <WhatsAppPreview body={body} />}
      {activeChannel === 'booking' && <BookingPreview body={body} />}
      {activeChannel === 'expedia' && <ExpediaPreview body={body} />}

    </div>
  );
}
