import {
  BookOpenCheck,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { getUsuarioLogado } from "../../hooks/auth";
import styles from "./Header.module.css";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/questoes", label: "Questoes", icon: BookOpenCheck },
  { href: "/funcionamento", label: "Guia", icon: CircleHelp },
];

export default function Header({ currentPath, isLoggedIn, onLogout, onNavigate }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const usuario = getUsuarioLogado();

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
        aria-label="Ir para o painel"
      >
        <span className={styles.brandMark}>SS</span>
        <span>
          SESI SENAI
          <small>Matematica</small>
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
          const active =
            currentPath === item.href ||
            (item.href === "/funcionamento" && currentPath === "/guia");

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
            <span>{usuario?.email || "Usuario"}</span>
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
