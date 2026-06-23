const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "iaruswafhkb";

async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ mensagem: "Email e senha obrigatorios" });

  try {
    const q = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = q.rows[0];
    if (!user)
      return res.status(401).json({ mensagem: "Credenciais inválidas" });

    const match = bcrypt.compareSync(senha, user.senha);
    if (!match)
      return res.status(401).json({ mensagem: "Credenciais inválidas" });

    const token = jwt.sign(
      { sub: user.id, email: user.email, perfil: user.perfil },
      JWT_SECRET,
      {
        algorithm: "HS256",
      },
    );
    return res.json({
      token,
      usuario: { id: user.id, email: user.email, perfil: user.perfil },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro no login" });
  }
}

module.exports = { login };
