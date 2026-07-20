import './globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'COMPIA Editora',
  description: 'Loja virtual acadêmica de livros físicos e e-books sobre Inteligência Artificial.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
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
