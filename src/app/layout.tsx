import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decodorul Oficial',
  description:
    'Decodorul Oficial – știri și sumarizări oficiale. Aplicație Next.js + Tailwind care consumă un API GraphQL.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}


