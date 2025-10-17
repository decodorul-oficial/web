'use client';

import { NewsletterButton } from '@/components/newsletter/NewsletterButton';
import { Linkedin, Instagram } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export function Footer() {
  const { user, profile } = useAuth();
  
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="container-responsive py-8 text-sm text-gray-600">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left side - Copyright, Newsletter, and Social Media */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <p className="text-gray-700">© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}. Toate drepturile rezervate.</p>
            
            {/* Newsletter and Social Media Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8">
              {/* Newsletter Section */}
              <div className="flex flex-col items-center md:items-start gap-2">
                <p className="text-xs text-gray-500">Rămâi la curent cu legislația:</p>
                <NewsletterButton variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Newsletter
                </NewsletterButton>
              </div>

              {/* Social Media Links */}
              <div className="flex flex-col items-center md:items-start gap-2">
                <p className="text-xs text-gray-500">Urmărește-ne pe:</p>
                <div className="flex gap-4">
                  <a 
                    href="https://www.linkedin.com/company/decodorul-oficial/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-brand-info hover:text-brand-highlight transition-colors duration-200"
                    aria-label="Urmărește-ne pe LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                  <a 
                    href="https://www.instagram.com/decodorul.oficial/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-brand-info hover:text-brand-highlight transition-colors duration-200"
                    aria-label="Urmărește-ne pe Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Navigation Links and Payment Processor */}
          <div className="flex flex-col items-center md:items-end gap-4">
            {/* Legal Links */}
            <nav className="flex flex-wrap justify-center md:justify-end gap-4 text-xs">
              <a href="/arhiva" className="hover:underline">Arhivă</a>
              <a href="/stiri" className="hover:underline">Căutare</a>
              <a href="/sinteza-zilnica" className="hover:underline">Sinteza Zilnică</a>
              <a href="/contact" className="hover:underline">Contact</a>
              <a href="/privacy" className="hover:underline">Confidențialitate</a>
              <a href="/cookies" className="hover:underline">Cookies</a>
              <a href="/legal" className="hover:underline">Legal</a>
              {user && profile?.isNewsletterSubscribed && (
                <a href="/newsletter/unsubscribe" className="hover:underline">Dezabonare</a>
              )}
            </nav>
            
            {/* ANPC Consumer Protection Pictograms */}
            <div className="flex flex-col items-center gap-2">
              
              <div className="flex flex-row gap-1 items-center">
                <a 
                  href="https://anpc.ro/ce-este-sal/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                  aria-label="Soluționarea Alternativă a Litigiilor - ANPC"
                >
                  <img 
                    src="/anpc-sal.jpg" 
                    alt="Soluționarea Alternativă a Litigiilor (SAL)" 
                    className="w-[200px] h-[40px] sm:w-[250px] sm:h-[50px] object-contain"
                  />
                </a>
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                  aria-label="Soluționarea Online a Litigiilor - SOL"
                >
                  <img 
                    src="/anpc-sol.jpg" 
                    alt="Soluționarea Online a Litigiilor (SOL)" 
                    className="w-[200px] h-[40px] sm:w-[250px] sm:h-[50px] object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Payment Processor Info */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Plăți securizate prin</span>
              <iframe
                src="https://mny.ro/npId.html?color=%23f9fafb&version=orizontal&secret=155391"
                style={{ border: "none", width: "120px", height: "22px" }}
                title="NETOPIA Payments"
              ></iframe>
              <span className="text-xs">Autorizat BNR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


