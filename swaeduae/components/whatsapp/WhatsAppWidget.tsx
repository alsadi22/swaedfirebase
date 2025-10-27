'use client';

import { MessageCircle, Users, Phone, QrCode, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import {
  openWhatsAppChat,
  joinWhatsAppGroup,
  shareWhatsAppLink,
  WhatsAppTemplates,
  defaultWhatsAppConfig,
} from '@/lib/services/whatsapp';

interface WhatsAppWidgetProps {
  type?: 'support' | 'volunteer' | 'organization' | 'event';
  phoneNumber?: string;
  groupLink?: string;
  customMessage?: string;
  showQR?: boolean;
}

export function WhatsAppWidget({
  type = 'support',
  phoneNumber,
  groupLink,
  customMessage,
  showQR = false,
}: WhatsAppWidgetProps) {
  const { locale } = useLanguage();

  const handleChatClick = () => {
    const number = phoneNumber || defaultWhatsAppConfig.businessNumber;
    const message = customMessage || WhatsAppTemplates.generalSupport();
    openWhatsAppChat(number, message);
  };

  const handleGroupClick = () => {
    if (groupLink) {
      joinWhatsAppGroup(groupLink);
    }
  };

  const handleShare = async () => {
    const link = groupLink || `https://wa.me/${phoneNumber}`;
    await shareWhatsAppLink(
      t(locale, 'whatsapp.title'),
      t(locale, 'whatsapp.connectWithUs'),
      link
    );
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <MessageCircle className="h-5 w-5" />
          {t(locale, 'whatsapp.title')}
        </CardTitle>
        <CardDescription>{t(locale, 'whatsapp.connectWithUs')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {phoneNumber && (
          <Button
            onClick={handleChatClick}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Phone className="mr-2 h-4 w-4" />
            {t(locale, 'whatsapp.quickChat')}
          </Button>
        )}

        {groupLink && (
          <Button
            onClick={handleGroupClick}
            variant="outline"
            className="w-full border-green-600 text-green-700 hover:bg-green-50"
          >
            <Users className="mr-2 h-4 w-4" />
            {t(locale, 'whatsapp.joinGroup')}
          </Button>
        )}

        {(groupLink || phoneNumber) && (
          <Button
            onClick={handleShare}
            variant="ghost"
            className="w-full text-green-700 hover:bg-green-50"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t(locale, 'whatsapp.shareLink')}
          </Button>
        )}

        {showQR && (
          <div className="mt-4 flex justify-center">
            <div className="rounded-lg border-2 border-green-200 p-4">
              <QrCode className="h-24 w-24 text-green-700" />
              <p className="mt-2 text-center text-sm text-gray-600">
                {t(locale, 'whatsapp.scanQR')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Floating WhatsApp button for quick access
 */
export function WhatsAppFloatingButton() {
  const { locale } = useLanguage();

  const handleClick = () => {
    openWhatsAppChat(
      defaultWhatsAppConfig.businessNumber,
      WhatsAppTemplates.generalSupport()
    );
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-700"
      aria-label={t(locale, 'whatsapp.chatWithSupport')}
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
