'use client';

import { AuthProvider } from '@/hooks/useAuth';
import AppContent from '@/components/AppContent';

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
