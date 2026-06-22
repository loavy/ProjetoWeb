const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme123";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensagem: "Token ausente" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, perfil: payload.perfil };
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado" });
  }
}

module.exports = authMiddleware;
