import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guest Check-In Demo — The Statler New York',
  description: 'Guest-facing check-in flow demo',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-[#1a1a2e] flex overflow-hidden">
      {children}
    </div>
  );
}
