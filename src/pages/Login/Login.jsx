// Importa ícones do Lucide React
import { AlertCircle, Loader2, LogIn } from "lucide-react";
// Importa hook useState do React
import { useState } from "react";
// Importa função para salvar sessão do usuário
import { salvarSessao } from "../../hooks/auth";
// Importa função para fazer requisições à API
import { apiFetch } from "../../hooks/useApi";
// Importa estilos CSS do componente
import styles from "./Login.module.css";

/**
 * Componente de Login
 * Renderiza formulário para autenticação do usuário
 * @param {Object} props - Props do componente
 * @param {Function} props.onLogin - Callback chamado após login bem-sucedido
 */
export default function Login({ onLogin }) {
  // Estado para armazenar mensagens de erro
  const [erro, setErro] = useState("");
  // Estado para controlar se está carregando (enviando requisição)
  const [carregando, setCarregando] = useState(false);

  /**
   * Manipulador do envio do formulário de login
   * @param {Event} event - Evento do formulário
   */
  async function handleSubmit(event) {
    // Previne o comportamento padrão do formulário
    event.preventDefault();
    // Limpa erros anteriores
    setErro("");
    // Define estado de carregamento
    setCarregando(true);

    // Extrai dados do formulário
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const senha = String(formData.get("senha") || "");

    try {
      // Faz requisição de login na API
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      // Salva o token e dados do usuário na sessão (localStorage)
      salvarSessao({
        token: data.token,
        usuario: data.usuario || { email },
      });

      // Chama callback de login bem-sucedido
      onLogin();
    } catch (error) {
      // Exibe mensagem de erro se houver falha
      setErro(error.message || "Erro ao realizar login.");
    } finally {
      // Define estado de carregamento como false
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
