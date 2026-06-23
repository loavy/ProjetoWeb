import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { salvarSessao } from "../../hooks/auth";
import { apiFetch } from "../../hooks/useApi";
import styles from "./Login.module.css";

// Pagina de login: usuario informa email e senha para obter JWT do backend.
export default function Login({ onLogin }) {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    // Prevencao de reload vindo do submit do formulario.
    event.preventDefault();
    setErro("");
    setCarregando(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const senha = String(formData.get("senha") || "");

    try {
      // Chama o endpoint de autenticação com email e senha.
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      // Armazena o token JWT e os dados do usuario no localStorage.
      salvarSessao({
        token: data.token,
        usuario: data.usuario || { email },
      });

      // Sinaliza ao pai (App) que o login foi concluido.
      onLogin();
    } catch (error) {
      setErro(error.message || "Erro ao realizar login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.media} aria-hidden="true">
          <div>
            <span>Projeto SESI SENAI</span>
            <h1>Sistema de Gestao de Fornecimento</h1>
            <p>Gerencie empresas fornecedoras e produtos vinculados com JWT.</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <span>Acesso</span>
            <h2>Entrar na plataforma</h2>
            <p>Use seu e-mail e senha cadastrados no backend.</p>
          </div>

          {erro && (
            <div className={styles.alert} role="alert">
              <AlertCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          <label className={styles.field} htmlFor="email">
            <span>E-mail</span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field} htmlFor="senha">
            <span>Senha</span>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={carregando}>
            {carregando ? <Loader2 className={styles.spinner} size={18} /> : <LogIn size={18} />}
            <span>{carregando ? "Entrando..." : "Entrar"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
