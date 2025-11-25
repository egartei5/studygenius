import { FirebaseClientProvider } from '@/firebase';
import type React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
