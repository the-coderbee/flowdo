'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { AuthButtons } from '../auth/auth-buttons';
import { ThemeToggle } from '../theme/theme-toggle';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Define links based on authentication status
  const navLinks = isAuthenticated 
    ? [
        { text: 'Tasks', href: '/tasks' },
        { text: 'Pomodoro', href: '/pomodoro' },
      ]
    : [
        { text: 'Home', href: '/' },
        { text: 'Features', href: '/#features' },
        { text: 'Pricing', href: '/#pricing' },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={isAuthenticated ? '/tasks' : '/'} className="flex-shrink-0 flex items-center">
              <Image src="/images/brand/logo-nobg.png" alt="FlowDo Logo" width={220} height={100} />
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-md font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {link.text}
              </Link>
            ))}
            <div className="flex items-center ml-2">
              <ThemeToggle />
              <AuthButtons />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <ThemeToggle />
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                /* Icon when menu is open */
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.text}
              </Link>
            ))}
            <div className="px-3 py-2">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 