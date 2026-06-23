import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
} from "lucide-react";
import { useState } from "react";
import styles from "./Header.module.css";
import logo from "/public/product.svg";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/produtos", label: "Produtos", icon: Package },
];

export default function Header({
  currentPath,
  isLoggedIn,
  onLogout,
  onNavigate,
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  function navegar(event, href) {
    setMenuAberto(false);
    onNavigate(event, href);
  }

  return (
    <header className={styles.header}>
      <a
        href="/"
        className={styles.brand}
        onClick={(event) => navegar(event, "/")}
        aria-label="Ir para o dashboard"
      >
        <span className={styles.brandMark}>
          <img src={logo} alt="logo" />
        </span>
        <span>
          Sistema de Gestao
          <small>Fornecimento</small>
        </span>
      </a>

      <button
        className={styles.menuButton}
        type="button"
        onClick={() => setMenuAberto((aberto) => !aberto)}
        aria-expanded={menuAberto}
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        title={menuAberto ? "Fechar menu" : "Abrir menu"}
      >
        {menuAberto ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={`${styles.nav} ${menuAberto ? styles.open : ""}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => navegar(event, item.href)}
              className={`${styles.navLink} ${active ? styles.active : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </a>
          );
        })}

        {isLoggedIn && (
          <div className={styles.session}>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={onLogout}
              title="Sair"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
