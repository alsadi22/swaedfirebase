'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeDisplayProps {
  value: string;
  label: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
}

export function QRCodeDisplay({
  value,
  label,
  size = 256,
  level = 'H',
  includeMargin = true,
}: QRCodeDisplayProps) {
  const handleDownload = () => {
    const svg = document.getElementById(`qr-${label}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${label}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = document.getElementById(`qr-${label}`)?.outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${label}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            h1 {
              margin-bottom: 20px;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              background: white;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${label}</h1>
          <div class="qr-container">
            ${svg}
          </div>
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
            Print
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Scan this QR code for {label.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <QRCodeSVG
              id={`qr-${label}`}
              value={value}
              size={size}
              level={level}
              includeMargin={includeMargin}
              className="w-full h-full"
            />
          </div>
          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>
          </div>
          <div className="text-xs text-gray-500 text-center break-all">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for displaying both check-in and check-out QR codes
interface EventQRCodesProps {
  eventId: string;
  checkInCode: string;
  checkOutCode: string;
  eventTitle: string;
}

export function EventQRCodes({ eventId, checkInCode, checkOutCode, eventTitle }: EventQRCodesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <QRCodeDisplay
        value={checkInCode}
        label="Check-In"
        size={200}
      />
      <QRCodeDisplay
        value={checkOutCode}
        label="Check-Out"
        size={200}
      />
    </div>
  );
}
