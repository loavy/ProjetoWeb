// Importa o módulo jsonwebtoken para verificação de tokens
const jwt = require("jsonwebtoken");

// Define a chave secreta para validar tokens JWT (usa variável de ambiente ou valor padrão)
const JWT_SECRET = process.env.JWT_SECRET || "changeme123";

/**
 * Middleware de autenticação
 * Valida se o token JWT fornecido no header Authorization é válido
 * Se válido, adiciona os dados do usuário ao objeto req
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Próxima função middleware
 * @returns {void} Chama next() se autenticado ou retorna erro 401
 */
function authMiddleware(req, res, next) {
  // Extrai o header Authorization
  const header = req.headers.authorization;
  
  // Verifica se o header existe e começa com "Bearer "
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensagem: "Token ausente" });
  }

  // Extrai o token do header (remove "Bearer " do começo)
  const token = header.split(" ")[1];

  try {
    // Verifica e decodifica o token JWT
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Adiciona os dados do usuário ao objeto req para uso posterior
    req.user = { id: payload.sub, email: payload.email, perfil: payload.perfil };
    
    // Chama o próximo middleware ou controlador
    next();
  } catch {
    // Retorna erro 401 se o token é inválido ou expirado
    return res.status(401).json({ mensagem: "Token inválido ou expirado" });
  }
}

// Exporta o middleware para uso em rotas
module.exports = authMiddleware;
