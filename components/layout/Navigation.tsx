'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Package,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const customerNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schedule Pickup', href: '/schedule-pickup', icon: Calendar },
  { name: 'My Returns', href: '/returns', icon: Package },
  { name: 'Account', href: '/account', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pickups', href: '/admin/pickups', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: User },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface NavigationProps {
  variant?: 'customer' | 'admin';
}

export function Navigation({ variant = 'customer' }: NavigationProps) {
  const pathname = usePathname();
  const navItems = variant === 'admin' ? adminNavItems : customerNavItems;

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#2563eb]/10 text-[#2563eb]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sign Out Button */}
      <div className="border-t border-gray-200 p-4">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
