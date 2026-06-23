const TOKEN_KEY = "token";
const USER_KEY = "usuario";

// Funcoes para gerenciar sessao no localStorage do navegador.
// O token JWT e os dados basicos do usuario sao armazenados aqui.
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
  // Salva token e dados de usuario no localStorage para manter sessao.
  // Esse dado eh usado para autenticar futuras requisicoes e mostrar o email.
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function isAuthenticated() {
  // Determina se o usuario esta autenticado pelo token e pelos dados armazenados.
  return Boolean(getToken() && getUsuarioLogado());
}

export function isAdmin() {
  // Verifica se o perfil do usuario logado e admin.
  return getUsuarioLogado()?.perfil === "admin";
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
