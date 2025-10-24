'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'

interface QRGeneratorProps {
  data: string
  size?: number
}

export function QRGenerator({ data, size = 256 }: QRGeneratorProps) {
  const [qrCode, setQrCode] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(data, { width: size, margin: 2 })
      .then(url => setQrCode(url))
      .catch(err => console.error(err))
  }, [data, size])

  return qrCode ? (
    <img src={qrCode} alt="QR Code" className="mx-auto" />
  ) : (
    <div className="animate-pulse bg-gray-200" style={{ width: size, height: size }} />
  )
}
