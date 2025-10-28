import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="container-responsive flex-1 py-8" role="main">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="text-gray-400">/</div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="width-full mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-10 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>

          {/* Navigation skeleton */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Title skeleton */}
              <div className="border-b border-gray-200 pb-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Content skeleton */}
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Metadata skeleton */}
              <div className="border-t border-gray-200 pt-4 mt-8">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info box skeleton */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="h-4 w-48 bg-blue-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-full bg-blue-200 rounded animate-pulse"></div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
