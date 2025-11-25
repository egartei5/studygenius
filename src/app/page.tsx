import { MainApp } from '@/components/main-app';
import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>}>
      <MainApp />
    </Suspense>
  );
}
