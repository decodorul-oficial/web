import { NewsletterButton } from '@/components/newsletter/NewsletterButton';

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="container-responsive py-10 text-sm text-gray-600">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <p>© {new Date().getFullYear()} Decodorul Oficial. Toate drepturile rezervate.</p>
            
            {/* Newsletter Section */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500">Rămâi la curent cu legislația:</p>
              <NewsletterButton variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Newsletter
              </NewsletterButton>
            </div>
          </div>
          
          <nav className="flex flex-wrap gap-4 text-xs">
            <a href="/contact" className="hover:underline">Contact</a>
            <a href="/privacy" className="hover:underline">Confidențialitate</a>
            <a href="/cookies" className="hover:underline">Cookies</a>
            <a href="/legal" className="hover:underline">Legal</a>
            <a href="/newsletter/unsubscribe" className="hover:underline">Dezabonare</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}


