/**
 * Social Login Buttons Component
 * Provides social authentication options
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { Chrome, Facebook, Apple } from 'lucide-react';

interface SocialLoginButtonsProps {
  mode?: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  mode = 'login',
  onSuccess,
  onError,
}) => {
  const { signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = async (
    provider: 'google' | 'facebook' | 'apple',
    loginFn: () => Promise<void>
  ) => {
    setLoading(provider);
    try {
      await loginFn();
      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message || `Failed to ${mode} with ${provider}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('google', signInWithGoogle)}
        disabled={loading !== null}
      >
        <Chrome className="mr-2 h-4 w-4" />
        {loading === 'google' ? 'Connecting...' : `${mode === 'login' ? 'Sign in' : 'Sign up'} with Google`}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('facebook', signInWithFacebook)}
        disabled={loading !== null}
      >
        <Facebook className="mr-2 h-4 w-4" />
        {loading === 'facebook' ? 'Connecting...' : `${mode === 'login' ? 'Sign in' : 'Sign up'} with Facebook`}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('apple', signInWithApple)}
        disabled={loading !== null}
      >
        <Apple className="mr-2 h-4 w-4" />
        {loading === 'apple' ? 'Connecting...' : `${mode === 'login' ? 'Sign in' : 'Sign up'} with Apple`}
      </Button>
    </div>
  );
};
