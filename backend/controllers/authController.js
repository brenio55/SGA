import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
  try {
    const { company_id, email, password } = req.body;

    if (!company_id || !email || !password) {
      return res.status(400).json({ error: 'company_id, email e password são obrigatórios' });
    }

    // Buscar usuário por email e company_id
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar se o usuário pertence à empresa informada
    if (user.company_id !== Number(company_id)) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token: 'mock-token' // TODO: implementar JWT token real
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

