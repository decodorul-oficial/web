import { Metadata } from 'next';
import { Suspense } from 'react';
import { InstagramFeed } from '@/components/admin/InstagramFeed';

export const metadata: Metadata = {
  title: 'Admin - Instagram Feed',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminInstagramPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand to-brand-accent">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            📱 Instagram Feed Generator
          </h1>
          <p className="text-brand-soft text-lg">
            Generează imagini în stil Instagram pentru ultimele știri
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }>
          <InstagramFeed />
        </Suspense>
      </div>
    </div>
  );
}
