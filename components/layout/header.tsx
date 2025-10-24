'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
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
                    <Link href="/auth/login">
                      <Button variant="outline" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button variant="primary" size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
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
