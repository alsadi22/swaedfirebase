'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  User, 
  Calendar, 
  Award, 
  Clock, 
  Settings, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Bell, 
  Shield, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userType: 'volunteer' | 'organization' | 'admin' | 'student'
  onSignOut: () => void
  language: 'en' | 'ar'
}

const volunteerMenu = [
  { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: Home, href: '/dashboard' },
  { id: 'profile', label: { en: 'Profile', ar: 'الملف الشخصي' }, icon: User, href: '/dashboard/profile' },
  { id: 'events', label: { en: 'Events', ar: 'الفعاليات' }, icon: Calendar, href: '/events' },
  { id: 'applications', label: { en: 'My Applications', ar: 'طلباتي' }, icon: FileText, href: '/dashboard/applications' },
  { id: 'hours', label: { en: 'Volunteer Hours', ar: 'ساعات التطوع' }, icon: Clock, href: '/dashboard/hours' },
  { id: 'badges', label: { en: 'Badges & Achievements', ar: 'الشارات والإنجازات' }, icon: Award, href: '/dashboard/badges' },
  { id: 'certificates', label: { en: 'Certificates', ar: 'الشهادات' }, icon: FileText, href: '/dashboard/certificates' },
  { id: 'settings', label: { en: 'Settings', ar: 'الإعدادات' }, icon: Settings, href: '/dashboard/settings' },
]

const organizationMenu = [
  { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: Home, href: '/organization/dashboard' },
  { id: 'profile', label: { en: 'Organization Profile', ar: 'ملف المؤسسة' }, icon: Building2, href: '/organization/settings' },
  { id: 'events', label: { en: 'Events', ar: 'الفعاليات' }, icon: Calendar, href: '/organization/events' },
  { id: 'create-event', label: { en: 'Create Event', ar: 'إنشاء فعالية' }, icon: Calendar, href: '/organization/events/create' },
  { id: 'volunteers', label: { en: 'Volunteers', ar: 'المتطوعون' }, icon: Users, href: '/organization/volunteers' },
  { id: 'analytics', label: { en: 'Analytics', ar: 'التحليلات' }, icon: BarChart3, href: '/organization/analytics' },
  { id: 'notifications', label: { en: 'Notifications', ar: 'الإشعارات' }, icon: Bell, href: '/notifications' },
  { id: 'settings', label: { en: 'Settings', ar: 'الإعدادات' }, icon: Settings, href: '/organization/settings' },
]

const adminMenu = [
  { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: Home, href: '/admin/dashboard' },
  { id: 'users', label: { en: 'Users', ar: 'المستخدمون' }, icon: Users, href: '/admin/users' },
  { id: 'organizations', label: { en: 'Organizations', ar: 'المؤسسات' }, icon: Building2, href: '/admin/organizations' },
  { id: 'events', label: { en: 'Events', ar: 'الفعاليات' }, icon: Calendar, href: '/admin/events' },
  { id: 'badges', label: { en: 'Badges', ar: 'الشارات' }, icon: Award, href: '/admin/badges' },
  { id: 'certificates', label: { en: 'Certificates', ar: 'الشهادات' }, icon: FileText, href: '/admin/certificates' },
  { id: 'audit-logs', label: { en: 'Audit Logs', ar: 'سجلات التدقيق' }, icon: Shield, href: '/admin/audit-logs' },
  { id: 'reports', label: { en: 'Reports', ar: 'التقارير' }, icon: BarChart3, href: '/admin/reports' },
  { id: 'settings', label: { en: 'System Settings', ar: 'إعدادات النظام' }, icon: Settings, href: '/admin/settings' },
]

export function Sidebar({ userType, onSignOut, language }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const menuItems = userType === 'volunteer' || userType === 'student' 
    ? volunteerMenu 
    : userType === 'organization' 
      ? organizationMenu 
      : adminMenu

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive 
            ? 'bg-[#D2A04A] text-white' 
            : 'text-[#5C3A1F] hover:bg-[#F8F6F0]'
        )}
      >
        <Icon size={20} />
        {isOpen && (
          <span className="font-medium">{item.label[language]}</span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
        aria-label={language === 'en' ? 'Open menu' : 'فتح القائمة'}
      >
        <Menu className="text-[#5C3A1F]" size={24} />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-[#E5E5E5] z-50 transition-all duration-300',
          'md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          isOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
            {isOpen && (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#5C3A1F] rounded-lg flex items-center justify-center text-white font-bold">
                  S
                </div>
                <span className="text-xl font-bold text-[#5C3A1F]">SwaedUAE</span>
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-[#F8F6F0]"
              aria-label={language === 'en' ? 'Toggle sidebar' : 'تبديل الشريط الجانبي'}
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E5E5E5]">
            <button
              onClick={onSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-[#CE1126] rounded-lg hover:bg-[#F8F6F0] transition-colors"
            >
              <LogOut size={20} />
              {isOpen && (
                <span className="font-medium">
                  {language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}