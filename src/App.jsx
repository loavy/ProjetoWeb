import { useEffect, useMemo, useState } from "react";

import Header from "./components/Header/Header";
import NotFound from "./pages/404/NotFound";
import ComoFunciona from "./pages/ComoFunciona/ComoFunciona";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Questoes from "./pages/Questoes/Questoes";

import { isAuthenticated, logout } from "./hooks/auth";

const rotasProtegidas = ["/", "/questoes", "/funcionamento", "/guia"];

function getCurrentPath() {
  return window.location.pathname || "/";
}

function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  const [usuarioLogado, setUsuarioLogado] = useState(isAuthenticated);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(getCurrentPath());

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (rotasProtegidas.includes(currentPath) && !usuarioLogado) {
      window.history.replaceState({}, "", "/login");
    }
  }, [currentPath, usuarioLogado]);

  function navegar(eventOrPath, maybePath) {
    const path = typeof eventOrPath === "string" ? eventOrPath : maybePath;

    if (eventOrPath?.preventDefault) {
      eventOrPath.preventDefault();
    }

    if (!path) {
      return;
    }

    if (rotasProtegidas.includes(path) && !usuarioLogado) {
      window.history.pushState({}, "", "/login");
      setCurrentPath("/login");
      return;
    }

    window.history.pushState({}, "", path);
    setCurrentPath(path);
  }

  function handleLogin() {
    setUsuarioLogado(true);
    navegar("/");
  }

  function handleLogout(event) {
    event?.preventDefault();
    logout();
    setUsuarioLogado(false);
    window.history.pushState({}, "", "/login");
    setCurrentPath("/login");
  }

  const pathPermitido = useMemo(() => {
    if (rotasProtegidas.includes(currentPath) && !usuarioLogado) {
      return "/login";
    }

    return currentPath;
  }, [currentPath, usuarioLogado]);

  const pages = {
    "/": <Home onNavigate={navegar} />,
    "/login": <Login onLogin={handleLogin} />,
    "/questoes": <Questoes />,
    "/funcionamento": <ComoFunciona />,
    "/guia": <ComoFunciona />,
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
