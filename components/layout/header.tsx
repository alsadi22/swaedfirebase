'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { NotificationDropdown } from '@/components/ui/notification-dropdown'

export function Header() {
  const router = useRouter()
  const { user, error, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false)
  const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as 'en' | 'ar' || 'en'
    setLanguage(storedLang)
  }, [])

  const handleSignOut = () => {
    window.location.href = '/api/auth/logout'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en'
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
    document.documentElement.lang = newLang
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <header className="modern-header fixed top-0 left-0 right-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#5C3A1F] rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl md:text-2xl font-bold text-[#5C3A1F]">
              SwaedUAE
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
              {language === 'en' ? 'Events' : 'الفعاليات'}
            </Link>
            <Link href="/organizations" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
              {language === 'en' ? 'Organizations' : 'المؤسسات'}
            </Link>
            <Link href="/about" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
              {language === 'en' ? 'About' : 'عن الموقع'}
            </Link>
            <Link href="/contact" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
              {language === 'en' ? 'Contact' : 'اتصل بنا'}
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationDropdown userId={user.id} />
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
                </Button>
              </>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="text-[#5C3A1F] hover:text-[#D2A04A] p-2"
                  >
                    <Search size={20} />
                  </button>
                  {isSearchOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#E5E5E5] p-4 z-50">
                      <form onSubmit={handleSearch}>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={language === 'en' ? "Search events, orgs..." : "البحث عن فعاليات، مؤسسات..."}
                          className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2A04A]"
                          autoFocus
                        />
                        <button type="submit" className="hidden">Search</button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#D2A04A] hover:bg-[#5C3A1F] text-white rounded-lg font-medium transition-colors"
                  >
                    {language === 'en' ? 'Login' : 'تسجيل الدخول'}
                    <ChevronDown size={16} />
                  </button>
                  {isLoginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E5] py-2 z-50">
                      <a
                        href="/api/auth/login?user_type=volunteer"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#F8F6F0] transition-colors"
                        onClick={() => setIsLoginDropdownOpen(false)}
                      >
                        {language === 'en' ? 'As a Volunteer' : 'كمتطوع'}
                      </a>
                      <a
                        href="/api/auth/login?user_type=organization"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#F8F6F0] transition-colors"
                        onClick={() => setIsLoginDropdownOpen(false)}
                      >
                        {language === 'en' ? 'As an Organization' : 'كمؤسسة'}
                      </a>
                    </div>
                  )}
                </div>

                {/* Signup Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSignupDropdownOpen(!isSignupDropdownOpen)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#5C3A1F] hover:bg-[#D2A04A] text-white rounded-lg font-medium transition-colors"
                  >
                    {language === 'en' ? 'Signup' : 'التسجيل'}
                    <ChevronDown size={16} />
                  </button>
                  {isSignupDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E5] py-2 z-50">
                      <a
                        href="/api/auth/login?screen_hint=signup&user_type=volunteer"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#F8F6F0] transition-colors"
                        onClick={() => setIsSignupDropdownOpen(false)}
                      >
                        {language === 'en' ? 'As a Volunteer' : 'كمتطوع'}
                      </a>
                      <a
                        href="/api/auth/login?screen_hint=signup&user_type=organization"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#F8F6F0] transition-colors"
                        onClick={() => setIsSignupDropdownOpen(false)}
                      >
                        {language === 'en' ? 'As an Organization' : 'كمؤسسة'}
                      </a>
                    </div>
                  )}
                </div>

                {/* Arabic Language Switcher */}
                <button 
                  onClick={toggleLanguage}
                  className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium px-3 py-2 rounded-lg hover:bg-[#F8F6F0] transition-colors"
                  title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
                >
                  {language === 'en' ? 'عربي' : 'English'}
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-[#5C3A1F]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E5E5]">
            <nav className="flex flex-col space-y-4">
              <Link href="/events" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                {language === 'en' ? 'Events' : 'الفعاليات'}
              </Link>
              <Link href="/organizations" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                {language === 'en' ? 'Organizations' : 'المؤسسات'}
              </Link>
              <Link href="/about" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                {language === 'en' ? 'About' : 'عن الموقع'}
              </Link>
              <Link href="/contact" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                {language === 'en' ? 'Contact' : 'اتصل بنا'}
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-[#E5E5E5]">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                      {language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
                    </Button>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleSearch} className="mb-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={language === 'en' ? "Search events, organizations..." : "البحث عن فعاليات، مؤسسات..."}
                        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2A04A]"
                      />
                    </form>
                    <div className="space-y-2">
                      <p className="text-xs text-[#6B7280] font-medium">
                        {language === 'en' ? 'Login as:' : 'تسجيل الدخول كـ:'}
                      </p>
                      <Link href="/auth/volunteer/login">
                        <Button variant="outline" size="sm" className="w-full">
                          {language === 'en' ? 'Volunteer' : 'متطوع'}
                        </Button>
                      </Link>
                      <Link href="/auth/organization/login">
                        <Button variant="outline" size="sm" className="w-full">
                          {language === 'en' ? 'Organization' : 'مؤسسة'}
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-[#6B7280] font-medium">
                        {language === 'en' ? 'Signup as:' : 'التسجيل كـ:'}
                      </p>
                      <Link href="/auth/volunteer/register">
                        <Button variant="primary" size="sm" className="w-full">
                          {language === 'en' ? 'Volunteer' : 'متطوع'}
                        </Button>
                      </Link>
                      <Link href="/auth/organization/register">
                        <Button variant="primary" size="sm" className="w-full">
                          {language === 'en' ? 'Organization' : 'مؤسسة'}
                        </Button>
                      </Link>
                    </div>
                    <button 
                      onClick={toggleLanguage}
                      className="w-full text-center py-2 text-[#5C3A1F] hover:text-[#D2A04A] font-medium border border-[#E5E5E5] rounded-lg"
                    >
                      {language === 'en' ? 'عربي' : 'English'}
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}