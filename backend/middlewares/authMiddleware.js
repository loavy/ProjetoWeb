const jwt = require("jsonwebtoken");

// Chave secreta usada para validar tokens JWT.
// Deve ser a mesma chave configurada no frontend/ambiente de produção.
const JWT_SECRET = process.env.JWT_SECRET || "changeme123";

function authMiddleware(req, res, next) {
  // Verifica se o cabecalho Authorization foi enviado no formato "Bearer <token>"
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensagem: "Token ausente" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Se o token for valido, grava os dados do usuario em req.user.
    // Isso permite acessar autorizacao e perfil dentro dos controllers.
    req.user = { id: payload.sub, email: payload.email, perfil: payload.perfil };
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado" });
  }
}

module.exports = authMiddleware;
