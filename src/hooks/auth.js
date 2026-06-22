const TOKEN_KEY = "token";
const USER_KEY = "usuario";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuarioLogado() {
  const usuario = localStorage.getItem(USER_KEY);

  if (!usuario) {
    return null;
  }

  try {
    return JSON.parse(usuario);
  } catch {
    return null;
  }
}

export function salvarSessao({ token, usuario }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function isAuthenticated() {
  return Boolean(getToken() && getUsuarioLogado());
}

export function isAdmin() {
  const usuario = getUsuarioLogado();
  return usuario?.perfil === "admin";
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
