export function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="container-responsive py-10 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <p>© {new Date().getFullYear()} Decodorul Oficial</p>
          <p className="text-xs">Build cu Next.js + TailwindCSS</p>
        </div>
      </div>
    </footer>
  );
}


