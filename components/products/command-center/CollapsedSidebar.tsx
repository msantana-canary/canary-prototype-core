'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Icon from '@mdi/react';
import {
  mdiViewDashboardOutline,
  mdiArrowUpBoldOutline,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiMessageTextOutline,
  mdiPhoneOutline,
  mdiCashMultiple,
  mdiCogOutline,
  mdiShieldCheckOutline,
  mdiFileDocumentOutline,
  mdiCardAccountDetailsOutline,
  mdiAccountMultipleOutline,
  mdiFlowerOutline,
  mdiLinkVariant,
} from '@mdi/js';
import { CanaryLogo } from '@canary-ui/components';

interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { id: 'home', icon: mdiViewDashboardOutline, label: 'Home', route: '/' },
  { id: 'upsells', icon: mdiArrowUpBoldOutline, label: 'Upsells', route: '/upsells' },
  { id: 'check-in', icon: mdiLoginVariant, label: 'Check-in', route: '/check-in' },
  { id: 'checkout', icon: mdiLogoutVariant, label: 'Checkout', route: '/checkout' },
  { id: 'messages', icon: mdiMessageTextOutline, label: 'Messages', route: '/command-center' },
  { id: 'calls', icon: mdiPhoneOutline, label: 'Calls', route: '/calls' },
  { id: 'digital-tips', icon: mdiCashMultiple, label: 'Digital Tips', route: '/digital-tips' },
];

const sidebarItemsSecondary: SidebarItem[] = [
  { id: 'authorizations', icon: mdiShieldCheckOutline, label: 'Authorizations', route: '/authorizations' },
  { id: 'contracts', icon: mdiFileDocumentOutline, label: 'Contracts', route: '/contracts' },
  { id: 'id-verification', icon: mdiCardAccountDetailsOutline, label: 'ID Verification', route: '/id-verification' },
  { id: 'clients', icon: mdiAccountMultipleOutline, label: 'Clients on File', route: '/clients-on-file' },
  { id: 'amenities', icon: mdiFlowerOutline, label: 'Amenities', route: '/amenities' },
  { id: 'payment-links', icon: mdiLinkVariant, label: 'Payment Links', route: '/payment-links' },
];

interface CollapsedSidebarProps {
  unreadCount?: number;
}

export function CollapsedSidebar({ unreadCount = 0 }: CollapsedSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (item: SidebarItem) => {
    if (item.id === 'messages') return pathname === '/command-center';
    return pathname === item.route;
  };

  const renderItem = (item: SidebarItem) => {
    const active = isActive(item);
    const showBadge = item.id === 'messages' && unreadCount > 0;

    return (
      <div
        key={item.id}
        className="relative flex items-center justify-center"
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <button
          onClick={() => router.push(item.route)}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all relative
            ${active
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white/80 hover:bg-white/8'
            }
          `}
        >
          <Icon path={item.icon} size={0.85} />
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {hoveredItem === item.id && (
          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md whitespace-nowrap z-50 shadow-lg">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[60px] h-full bg-[#1B2B3A] flex flex-col items-center py-3 shrink-0">
      <div className="mb-5 flex items-center justify-center">
        <CanaryLogo size="compact" />
      </div>

      <div className="flex-1 flex flex-col gap-1 w-full px-2.5">
        {sidebarItems.map(renderItem)}

        <div className="my-2 mx-1 border-t border-white/10" />

        {sidebarItemsSecondary.map(renderItem)}
      </div>

      <div className="w-full px-2.5 mb-1">
        {renderItem({
          id: 'settings',
          icon: mdiCogOutline,
          label: 'Settings',
          route: '/settings',
        })}
      </div>
    </div>
  );
}
