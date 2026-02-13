'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RBACGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RBACGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: RBACGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.role || 'user';
      if (!allowedRoles.includes(userRole)) {
        router.push(redirectTo);
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, allowedRoles, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-400"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role || 'user')) {
    return null;
  }

  return <>{children}</>;
}
