import { useEffect, useMemo, useState } from "react";

import Header from "./components/Header/Header";
import NotFound from "./pages/404/NotFound";
import Companies from "./pages/Companies/Companies";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Products from "./pages/Products/Products";

import { isAuthenticated, logout } from "./hooks/auth";

// Componente raiz do frontend. Controla navegacao manual e protecao de rotas.
// Nao utiliza um roteador externo; a navegacao e tratada por history API.

const aliases = {
  "/companies": "/empresas",
  "/products": "/produtos",
};

// Rotas que exigem autenticacao. Se o usuario nao estiver logado, ele sera redirecionado.
const rotasProtegidas = ["/", "/empresas", "/produtos", "/companies", "/products"];

function normalizarPath(path) {
  // Converte paths em ingles para rotas locais em portugues.
  // Isso permite que o mesmo componente aceite tanto /companies quanto /empresas.
  return aliases[path] || path || "/";
}

function getCurrentPath() {
  // Le o caminho atual do navegador e normaliza para as rotas internas.
  return normalizarPath(window.location.pathname || "/");
}

function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  // Estado local que controla se o usuario esta autenticado.
  const [usuarioLogado, setUsuarioLogado] = useState(isAuthenticated);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(getCurrentPath());

    // Sincroniza a rota com o historico do navegador (back/forward).
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (rotasProtegidas.includes(currentPath) && !usuarioLogado) {
      // Redireciona para login sempre que a rota protegida for acessada sem sessao.
      window.history.replaceState({}, "", "/login");
    }
  }, [currentPath, usuarioLogado]);

  function navegar(eventOrPath, maybePath) {
    const path = normalizarPath(
      typeof eventOrPath === "string" ? eventOrPath : maybePath,
    );
    const autenticado = usuarioLogado || isAuthenticated();

    // Evita recarregar a pagina quando um link interno e clicado.
    if (eventOrPath?.preventDefault) {
      eventOrPath.preventDefault();
    }

    // Evita recarregamento de pagina quando o link eh clicado.
    if (eventOrPath?.preventDefault) {
      eventOrPath.preventDefault();
    }

    if (!path) {
      return;
    }

    if (rotasProtegidas.includes(path) && !autenticado) {
      window.history.pushState({}, "", "/login");
      setCurrentPath("/login");
      return;
    }

    window.history.pushState({}, "", path);
    setCurrentPath(path);
  }

  function handleLogin() {
    // Atualiza estado de sessao apos login bem-sucedido.
    setUsuarioLogado(true);
    window.history.pushState({}, "", "/");
    setCurrentPath("/");
  }

  function handleLogout(event) {
    event?.preventDefault();
    // Remove o token e os dados de usuario do localStorage.
    logout();
    setUsuarioLogado(false);
    window.history.pushState({}, "", "/login");
    setCurrentPath("/login");
  }

  const pathPermitido = useMemo(() => {
    // Garantia de que apenas caminhos autorizados serao renderizados.
    // Se usuario nao estiver logado, forca login mesmo que o caminho atual seja protegido.
    if (rotasProtegidas.includes(currentPath) && !usuarioLogado) {
      return "/login";
    }

    return currentPath;
  }, [currentPath, usuarioLogado]);

  const pages = {
    "/": <Home onNavigate={navegar} />,
    "/login": <Login onLogin={handleLogin} />,
    "/empresas": <Companies />,
    "/produtos": <Products />,
  };

  return (
    <>
      {pathPermitido !== "/login" && (
        <Header
          currentPath={pathPermitido}
          isLoggedIn={usuarioLogado}
          onLogout={handleLogout}
          onNavigate={navegar}
        />
      )}

      {pages[pathPermitido] || <NotFound onNavigate={navegar} />}
    </>
  );
}

export default App;
