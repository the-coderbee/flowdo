'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';

import OnboardingPage from './onboarding/page';

export default function RootPage() {
  const {user, loading} = useAuth();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/tasks');
      } else {
        setShowOnboarding(true);
      }
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  
  return showOnboarding ? <OnboardingPage /> : null;
}