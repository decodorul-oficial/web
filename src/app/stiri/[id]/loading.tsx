export default function LoadingNewsPage() {
  return (
    <div className="container-responsive py-8 animate-pulse">
      <div className="mb-6 h-6 w-40 rounded bg-gray-200" />
      <div className="mb-4 h-10 w-2/3 rounded bg-gray-200" />
      <div className="mb-2 h-4 w-56 rounded bg-gray-200" />
      <div className="mb-6 h-4 w-48 rounded bg-gray-200" />
      <div className="mb-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 h-60 w-full rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
        <aside className="space-y-3">
          <div className="h-5 w-24 rounded bg-gray-200" />
          <div className="h-24 w-full rounded bg-gray-200" />
        </aside>
      </div>
    </div>
  );
}


