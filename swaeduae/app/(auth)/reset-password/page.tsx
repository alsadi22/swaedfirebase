/**
 * Reset Password Page
 * Allows users to set a new password after clicking email link
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!oobCode) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">SwaedUAE</h1>
          <p className="mt-2 text-gray-600">{t(language, 'auth.resetPassword')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t(language, 'auth.resetPassword')}</CardTitle>
            <CardDescription>
              { language === 'en'
                ? 'Enter your new password below.'
                : 'أدخل كلمة المرور الجديدة أدناه.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">{t(language, 'messages.passwordReset')}</p>
                    <p className="mt-1">
                      { language === 'en'
                        ? 'Redirecting you to login...'
                        : 'جاري إعادة توجيهك لتسجيل الدخول...'}
                    </p>
                  </div>
                </div>

                <Link href="/auth/login">
                  <Button className="w-full">
                    <ArrowLeft className={`h-4 w-4 ${ language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {t(language, 'auth.signIn')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t(language, 'auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t(language, 'auth.minCharacters')}
                    {...register('password')}
                    className={errors.password ? 'border-red-500' : ''}
                    autoFocus
                    disabled={!oobCode}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t(language, 'auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t(language, 'auth.reenterPassword')}
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    disabled={!oobCode}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading || !oobCode}>
                  {loading
                    ? ( language === 'en' ? 'Resetting...' : 'جاري إعادة التعيين...')
                    : t(language, 'auth.resetPassword')}
                </Button>

                <Link href="/auth/login">
                  <Button className="w-full" variant="ghost">
                    <ArrowLeft className={`h-4 w-4 ${ language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    { language === 'en' ? 'Back to Sign In' : 'العودة لتسجيل الدخول'}
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
