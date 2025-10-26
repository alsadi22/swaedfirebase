/**
 * Language Switcher Component
 * Allows users to switch between English and Arabic
 */

'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? 'عربي' : 'English'}</span>
    </Button>
  );
};
