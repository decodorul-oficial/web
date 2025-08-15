import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-responsive py-10">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="mt-2 text-gray-600">Aceasta este o pagină placeholder pentru autentificare.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}


