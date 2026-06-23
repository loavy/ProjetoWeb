import { ArrowLeft, Home } from "lucide-react";
import styles from "./NotFound.module.css";

function NotFound({ onNavigate }) {
  // Pagina exibida quando o usuario acessa uma rota inexistente.
  // Oferece acao de voltar para o dashboard ou retroceder no historico.
  function goHome() {
    // Retorna para a home via callback de navegacao se disponivel.
    if (onNavigate) {
      onNavigate("/");
      return;
    }

    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function goBack() {
    // Volta uma pagina do historico, ou entao vai para home se nao houver historico.
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    goHome();
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.code} aria-hidden="true">
          404
        </div>

        <div className={styles.content}>
          <span className={styles.badge}>Rota invalida</span>
          <h1>Pagina nao encontrada</h1>
          <p>
            O endereco acessado nao existe ou foi movido. Volte para uma pagina
            conhecida para continuar gerenciando o sistema.
          </p>

          <div className={styles.actions}>
            <button type="button" onClick={goHome}>
              <Home size={18} />
              <span>Ir para o painel</span>
            </button>
            <button type="button" className={styles.secondary} onClick={goBack}>
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
