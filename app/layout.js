import './globals.css';
import { Inter } from 'next/font/google';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'COMPIA Editora',
  description: 'Loja virtual acadêmica de livros físicos e e-books sobre Inteligência Artificial.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <AdminAuthProvider>
            <Header />
            <main className="site-main">{children}</main>
            <Footer />
          </AdminAuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
