import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const { company_id } = req.query;
    const users = await User.findAll(company_id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Não retornar senha
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsersByGroup = async (req, res) => {
  try {
    const { group_id } = req.params;
    const users = await User.findByGroup(group_id);
    res.json(users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { company_id, department_id, group_id, full_name, role, email, password, image_base64 } = req.body;

    if (!company_id || !full_name || !email || !password) {
      return res.status(400).json({ error: 'company_id, full_name, email e password são obrigatórios' });
    }

    // Verificar se email já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      company_id,
      department_id,
      group_id,
      full_name,
      role,
      email,
      password: hashedPassword,
      image_base64
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Se houver senha, fazer hash
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await User.update(id, data);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.delete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

