// Chave para armazenar o token JWT no localStorage
const TOKEN_KEY = "token";
// Chave para armazenar os dados do usuário no localStorage
const USER_KEY = "usuario";

/**
 * Obtém o token armazenado no localStorage
 * @returns {string|null} Token JWT ou null se não encontrado
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Obtém os dados do usuário logado armazenados no localStorage
 * @returns {Object|null} Dados do usuário ou null se não encontrado
 */
export function getUsuarioLogado() {
  // Obtém a string de usuário do localStorage
  const usuario = localStorage.getItem(USER_KEY);

  // Retorna null se não encontrou
  if (!usuario) {
    return null;
  }

  try {
    // Converte a string JSON para objeto
    return JSON.parse(usuario);
  } catch {
    // Retorna null se houver erro ao fazer parsing
    return null;
  }
}

/**
 * Salva a sessão do usuário (token e dados) no localStorage
 * @param {Object} dados - Objeto com token e usuário
 */
export function salvarSessao({ token, usuario }) {
  // Armazena o token JWT
  localStorage.setItem(TOKEN_KEY, token);
  // Armazena os dados do usuário como JSON
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} true se há token e usuário, false caso contrário
 */
export function isAuthenticated() {
  return Boolean(getToken() && getUsuarioLogado());
}

/**
 * Verifica se o usuário tem permissão de admin
 * @returns {boolean} true se o perfil do usuário é 'admin', false caso contrário
 */
export function isAdmin() {
  // Obtém o usuário logado
  const usuario = getUsuarioLogado();
  // Retorna true se o perfil é admin
  return usuario?.perfil === "admin";
}

/**
 * Remove a sessão do usuário (faz logout)
 */
export function logout() {
  // Remove o token do localStorage
  localStorage.removeItem(TOKEN_KEY);
  // Remove os dados do usuário do localStorage
  localStorage.removeItem(USER_KEY);
}
