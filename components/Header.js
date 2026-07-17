import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">C</span>
          <span>
            <strong>COMPIA</strong>
            <small>Editora</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link href="/produtos">Produtos</Link>
          <Link href="/admin/produtos">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
