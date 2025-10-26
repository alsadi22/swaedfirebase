/**
 * User Menu Component
 * Navigation dropdown for authenticated users
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Shield,
  Building2,
} from 'lucide-react';

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getRoleBadge = () => {
    const roleColors: Record<string, string> = {
      VOLUNTEER: 'bg-blue-100 text-blue-800',
      ORG_SUPERVISOR: 'bg-green-100 text-green-800',
      ORG_ADMIN: 'bg-green-100 text-green-800',
      OPERATOR: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
      SUPER_ADMIN: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
        {user.role.replace('_', ' ')}
      </span>
    );
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      show: true,
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      show: true,
    },
    {
      icon: Building2,
      label: 'Organization',
      href: '/organization',
      show: ['ORG_ADMIN', 'ORG_SUPERVISOR'].includes(user.role),
    },
    {
      icon: Shield,
      label: 'Admin Panel',
      href: '/admin',
      show: ['ADMIN', 'SUPER_ADMIN', 'OPERATOR'].includes(user.role),
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      show: true,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
              <p className="text-xs text-gray-500 mb-2">{user.email}</p>
              {getRoleBadge()}
            </div>

            <div className="py-2">
              {menuItems
                .filter(item => item.show)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>

            <div className="border-t border-gray-200 py-2">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
