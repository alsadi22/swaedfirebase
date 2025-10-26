/**
 * Email Verification Page
 * Prompts user to verify their email address
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, firebaseUser, sendVerificationEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendVerificationEmail();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (firebaseUser?.emailVerified) {
      router.push('/dashboard');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">SwaedUAE</h1>
          <p className="mt-2 text-gray-600">Email Verification</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification email to:<br />
              <span className="font-medium text-gray-900">{firebaseUser?.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
              <p className="font-medium mb-1">Check your inbox</p>
              <p>Click the verification link in the email to activate your account.</p>
              <p className="mt-2 text-xs text-blue-600">
                Don't forget to check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Verification email sent successfully!</span>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={handleContinue} className="w-full">
                I've Verified My Email
              </Button>

              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Need help?{' '}
                <Link href="/support" className="text-primary hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
