// Importa o módulo de conexão com o banco de dados
const db = require("../config/database");
// Importa bcryptjs para hash e comparação de senhas
const bcrypt = require("bcryptjs");
// Importa jsonwebtoken para geração de tokens JWT
const jwt = require("jsonwebtoken");

// Define a chave secreta para assinar os tokens JWT (usa variável de ambiente ou valor padrão)
const JWT_SECRET = process.env.JWT_SECRET || "iaruswafhkb";

/**
 * Função de login do usuário
 * Autentica o usuário pelo email e senha, e retorna um token JWT
 * @param {Object} req - Objeto da requisição (body contém email e senha)
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna token JWT e dados do usuário ou erro de autenticação
 */
async function login(req, res) {
  // Extrai email e senha do corpo da requisição
  const { email, senha } = req.body;
  
  // Valida se email e senha foram fornecidos
  if (!email || !senha)
    return res.status(400).json({ mensagem: "Email e senha obrigatorios" });

  try {
    // Busca o usuário no banco de dados pelo email
    const q = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = q.rows[0];
    
    // Se o usuário não existe, retorna erro 401 (Não autorizado)
    if (!user)
      return res.status(401).json({ mensagem: "Credenciais inválidas" });

    // Compara a senha fornecida com a senha hasheada armazenada
    const match = bcrypt.compareSync(senha, user.senha);
    
    // Se a senha não corresponder, retorna erro 401
    if (!match)
      return res.status(401).json({ mensagem: "Credenciais inválidas" });

    // Gera um token JWT assinado com os dados do usuário
    const token = jwt.sign(
      { sub: user.id, email: user.email, perfil: user.perfil },
      JWT_SECRET,
      {
        algorithm: "HS256",
      },
    );
    
    // Retorna o token e dados do usuário autenticado
    return res.json({
      token,
      usuario: { id: user.id, email: user.email, perfil: user.perfil },
    });
  } catch (err) {
    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro no login" });
  }
}

// Exporta a função de login para uso em outros arquivos (routes)
module.exports = { login };
