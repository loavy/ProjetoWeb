// Importa hooks do React
import { useEffect, useMemo, useState } from "react";

// Importa o componente Header (cabeçalho)
import Header from "./components/Header/Header";
// Importa página de 404 (não encontrado)
import NotFound from "./pages/404/NotFound";
// Importa página de Empresas
import Companies from "./pages/Companies/Companies";
// Importa página Home
import Home from "./pages/Home/Home";
// Importa página de Login
import Login from "./pages/Login/Login";
// Importa página de Produtos
import Products from "./pages/Products/Products";

// Importa funções de autenticação do hook
import { isAuthenticated, logout } from "./hooks/auth";

// Define um mapa de aliases para normalizar rotas (ex: /companies -> /empresas)
const aliases = {
  "/companies": "/empresas",
  "/products": "/produtos",
};

// Define quais rotas precisam de autenticação
const rotasProtegidas = ["/", "/empresas", "/produtos", "/companies", "/products"];

/**
 * Normaliza o caminho usando os aliases definidos
 * @param {string} path - Caminho a normalizar
 * @returns {string} Caminho normalizado
 */
function normalizarPath(path) {
  return aliases[path] || path || "/";
}

/**
 * Obtém o caminho atual da URL
 * @returns {string} Caminho normalizado atual
 */
function getCurrentPath() {
  return normalizarPath(window.location.pathname || "/");
}

/**
 * Componente principal da aplicação
 * Gerencia roteamento simples (SPA) e autenticação
 */
function App() {
  // Estado do caminho atual
  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  // Estado do usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(isAuthenticated);

  // Listener para botão voltar do navegador
  useEffect(() => {
    const handlePopState = () => setCurrentPath(getCurrentPath());

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Redireciona para login se tentar acessar rota protegida sem autenticação
  useEffect(() => {
    if (rotasProtegidas.includes(currentPath) && !usuarioLogado) {
      window.history.replaceState({}, "", "/login");
    }
  }, [currentPath, usuarioLogado]);

  /**
   * Função para navegar entre páginas
   * @param {string|Event} eventOrPath - Evento ou caminho de navegação
   * @param {string} maybePath - Caminho alternativo se o primeiro for um evento
   */
  function navegar(eventOrPath, maybePath) {
    // Normaliza o caminho
    const path = normalizarPath(
      typeof eventOrPath === "string" ? eventOrPath : maybePath,
    );
    // Verifica autenticação
    const autenticado = usuarioLogado || isAuthenticated();

    // Previne o comportamento padrão se for um evento
    if (eventOrPath?.preventDefault) {
      eventOrPath.preventDefault();
    }

    // Sai da função se o caminho estiver vazio
    if (!path) {
      return;
    }

    // Redireciona para login se a rota for protegida e o usuário não estiver autenticado
    if (rotasProtegidas.includes(path) && !autenticado) {
      window.history.pushState({}, "", "/login");
      setCurrentPath("/login");
      return;
    }

    // Atualiza o histórico e o estado
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  }

  /**
   * Manipulador de login bem-sucedido
   */
  function handleLogin() {
    setUsuarioLogado(true);
    window.history.pushState({}, "", "/");
    setCurrentPath("/");
  }

  /**
   * Manipulador de logout
   * @param {Event} event - Evento do clique
   */
  function handleLogout(event) {
    event?.preventDefault();
    logout();
    setUsuarioLogado(false);
    window.history.pushState({}, "", "/login");
    setCurrentPath("/login");
  }

  // Calcula o caminho permitido (redireciona para login se necessário)
  const pathPermitido = useMemo(() => {
    if (rotasProtegidas.includes(currentPath) && !usuarioLogado) {
      return "/login";
    }

    return currentPath;
  }, [currentPath, usuarioLogado]);

  // Mapa de componentes para cada página
  const pages = {
    "/": <Home onNavigate={navegar} />,
    "/login": <Login onLogin={handleLogin} />,
    "/empresas": <Companies />,
    "/produtos": <Products />,
  };

  return (
    <>
      {/* Exibe o Header se não estiver na página de login */}
      {pathPermitido !== "/login" && (
        <Header
          currentPath={pathPermitido}
          isLoggedIn={usuarioLogado}
          onLogout={handleLogout}
          onNavigate={navegar}
        />
      )}

      {/* Renderiza a página correspondente ou a página 404 */}
      {pages[pathPermitido] || <NotFound onNavigate={navegar} />}
    </>
  );
}

// Exporta o componente App
export default App;
