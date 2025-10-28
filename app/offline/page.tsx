'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">You're Offline</h1>
          <p className="text-gray-600">
            No internet connection detected. Some features may be limited.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Available Offline:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• View cached events</li>
              <li>• View your profile</li>
              <li>• View certificates (previously loaded)</li>
              <li>• Check-in/out (will sync when online)</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Requires Internet:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Browse new events</li>
              <li>• Apply to events</li>
              <li>• Real-time notifications</li>
              <li>• Update profile information</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        <div className="mt-4 text-sm text-gray-500">
          <Wifi className="w-4 h-4 inline mr-1" />
          Checking connection automatically...
        </div>
      </div>
    </div>
  );
}