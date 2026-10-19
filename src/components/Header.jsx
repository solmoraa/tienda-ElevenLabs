export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="DR Sport, inicio">
        <span className="brand-mark" aria-hidden="true">DR</span>
        <span>DR Sport</span>
      </a>
      <nav aria-label="Navegación principal">
        <a href="#coleccion">Colección</a>
        <a href="#como-funciona">Cómo funciona</a>
      </nav>
      <span className="header-status"><span></span> Asesor por voz</span>
    </header>
  );
}
