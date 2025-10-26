'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  active?: boolean;
}

export function QRScanner({ onScan, onError, active = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [active, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScanning(true);
        startScanning();
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      const errorMessage = error.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access to scan QR codes.'
        : error.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : 'Failed to access camera. Please check your browser settings.';
      
      setCameraError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  const startScanning = () => {
    const scan = () => {
      if (!videoRef.current || !canvasRef.current || !scanning) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        scanIntervalRef.current = requestAnimationFrame(scan);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // QR code found!
        onScan(code.data);
        
        // Draw detection box
        drawDetectionBox(context, code.location);
      }

      // Continue scanning
      scanIntervalRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const drawDetectionBox = (context: CanvasRenderingContext2D, location: any) => {
    context.beginPath();
    context.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    context.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    context.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    context.closePath();
    context.lineWidth = 4;
    context.strokeStyle = '#00FF00';
    context.stroke();
  };

  const switchCamera = async () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const retryCamera = () => {
    setCameraError(null);
    startCamera();
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {cameraError ? (
        <Card>
          <CardContent className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Error</h3>
            <p className="text-sm text-gray-600 mb-4">{cameraError}</p>
            <Button onClick={retryCamera}>Try Again</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Video and Canvas */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            
            {/* Scanning Indicator */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning line animation */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-green-500 animate-pulse" />
                
                {/* Corner markers */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white" />
              </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-center text-sm">
                Position the QR code within the frame
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex justify-center gap-2">
            <Button
              onClick={switchCamera}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Switch Camera
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
