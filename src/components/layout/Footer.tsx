export function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="container-responsive py-10 text-sm text-gray-600">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Decodorul Oficial. Toate drepturile rezervate.</p>
          <nav className="flex flex-wrap gap-4 text-xs">
            <a href="/contact" className="hover:underline">Contact</a>
            <a href="/privacy" className="hover:underline">Confidențialitate</a>
            <a href="/cookies" className="hover:underline">Cookies</a>
            <a href="/legal" className="hover:underline">Legal</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}


