'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Search, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false)
  const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-[#E5E5E5]">
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
              Events
            </Link>
            <Link href="/organizations" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
              Organizations
            </Link>
            <Link href="/about" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
              About
            </Link>
            <Link href="/contact" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/search">
                  <button className="text-[#5C3A1F] hover:text-[#D2A04A] p-2">
                    <Search size={20} />
                  </button>
                </Link>

                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#FF8C42] hover:bg-[#FF7629] text-white rounded-lg font-medium transition-colors"
                  >
                    Login
                    <ChevronDown size={16} />
                  </button>
                  {isLoginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E5] py-2 z-50">
                      <Link
                        href="/auth/volunteer/login"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#FDFBF7] transition-colors"
                        onClick={() => setIsLoginDropdownOpen(false)}
                      >
                        As a Volunteer
                      </Link>
                      <Link
                        href="/auth/organization/login"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#FDFBF7] transition-colors"
                        onClick={() => setIsLoginDropdownOpen(false)}
                      >
                        As an Organization
                      </Link>
                    </div>
                  )}
                </div>

                {/* Signup Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSignupDropdownOpen(!isSignupDropdownOpen)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#5C3A1F] hover:bg-[#D2A04A] text-white rounded-lg font-medium transition-colors"
                  >
                    Signup
                    <ChevronDown size={16} />
                  </button>
                  {isSignupDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E5] py-2 z-50">
                      <Link
                        href="/auth/volunteer/register"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#FDFBF7] transition-colors"
                        onClick={() => setIsSignupDropdownOpen(false)}
                      >
                        As a Volunteer
                      </Link>
                      <Link
                        href="/auth/organization/register"
                        className="block px-4 py-2 text-[#5C3A1F] hover:bg-[#FDFBF7] transition-colors"
                        onClick={() => setIsSignupDropdownOpen(false)}
                      >
                        As an Organization
                      </Link>
                    </div>
                  )}
                </div>

                {/* Arabic Language Switcher */}
                <button className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                  عربي
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
                Events
              </Link>
              <Link href="/organizations" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                Organizations
              </Link>
              <Link href="/about" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                About
              </Link>
              <Link href="/contact" className="text-[#5C3A1F] hover:text-[#D2A04A] font-medium">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-[#E5E5E5]">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs text-[#A0A0A0] font-medium">Login as:</p>
                      <Link href="/auth/volunteer/login">
                        <Button variant="outline" size="sm" className="w-full">
                          Volunteer
                        </Button>
                      </Link>
                      <Link href="/auth/organization/login">
                        <Button variant="outline" size="sm" className="w-full">
                          Organization
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-[#A0A0A0] font-medium">Signup as:</p>
                      <Link href="/auth/volunteer/register">
                        <Button variant="primary" size="sm" className="w-full">
                          Volunteer
                        </Button>
                      </Link>
                      <Link href="/auth/organization/register">
                        <Button variant="primary" size="sm" className="w-full">
                          Organization
                        </Button>
                      </Link>
                    </div>
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
