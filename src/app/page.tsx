'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import AppContent from '@/components/AppContent';

export default function Home() {
  useEffect(() => {
    // Set up any global initialization here
    console.log('Mind Map App initialized');
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
