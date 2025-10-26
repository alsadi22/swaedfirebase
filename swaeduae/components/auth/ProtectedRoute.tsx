/**
 * Protected Route Component
 * Wraps components that require authentication
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserRole } from '@/types';
import { canAccessRoute } from '@/lib/middleware/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectTo = '/auth/login',
  requireEmailVerification = false,
}) => {
  const router = useRouter();
  const { user, firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user || !firebaseUser) {
        router.push(redirectTo);
        return;
      }

      // Email verification required but not verified
      if (requireEmailVerification && !firebaseUser.emailVerified) {
        router.push('/auth/verify-email');
        return;
      }

      // Role-based access control
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, firebaseUser, loading, requiredRoles, requireEmailVerification, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or insufficient permissions
  if (!user || !firebaseUser) {
    return null;
  }

  if (requireEmailVerification && !firebaseUser.emailVerified) {
    return null;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
