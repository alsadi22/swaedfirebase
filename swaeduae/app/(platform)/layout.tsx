'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const navigation = [
    { name: t('nav.home', 'Home'), href: '/', roles: ['all'] },
    { name: t('nav.events', 'Events'), href: '/events', roles: ['all'] },
    { name: t('nav.dashboard', 'Dashboard'), href: '/dashboard', roles: ['VOLUNTEER', 'ORG_ADMIN', 'ORG_SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'] },
    { name: t('nav.organization', 'Organization'), href: '/organization/dashboard', roles: ['ORG_ADMIN', 'ORG_SUPERVISOR'] },
    { name: t('nav.profile', 'Profile'), href: '/profile', roles: ['VOLUNTEER'] },
    { name: t('nav.admin', 'Admin'), href: '/admin/dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">SwaedUAE</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => {
                  // Show link for all users or specific roles
                  const showLink = item.roles.includes('all') || (user && item.roles.includes('VOLUNTEER'));
                  if (!showLink) return null;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              
              {user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                      {t('auth.signIn', 'Sign In')}
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      {t('auth.signUp', 'Sign Up')}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const showLink = item.roles.includes('all') || (user && item.roles.includes('VOLUNTEER'));
              if (!showLink) return null;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <span className="text-2xl font-bold text-blue-600">SwaedUAE</span>
              <p className="mt-4 text-sm text-gray-600">
                {t('footer.tagline', 'Empowering communities through volunteerism across the UAE')}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {t('footer.forVolunteers', 'For Volunteers')}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">
                    {t('footer.browseEvents', 'Browse Events')}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                    {t('footer.signUp', 'Sign Up')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {t('footer.forOrganizations', 'For Organizations')}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                    {t('footer.registerOrg', 'Register Organization')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {t('footer.support', 'Support')}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                    {t('footer.about', 'About Us')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                    {t('footer.contact', 'Contact')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-400 text-center">
              &copy; 2025 SwaedUAE. {t('footer.rights', 'All rights reserved.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
