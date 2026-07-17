import './globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
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
        <AdminAuthProvider>
          <Header />
          <main className="site-main">{children}</main>
          <Footer />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
