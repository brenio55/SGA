import Group from '../models/Group.js';

export const getAllGroups = async (req, res) => {
  try {
    const { department_id } = req.query;
    const groups = await Group.findAll(department_id);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    
    if (!group) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { department_id, name, description } = req.body;

    if (!department_id || !name) {
      return res.status(400).json({ error: 'department_id e name são obrigatórios' });
    }

    const group = await Group.create({ department_id, name, description });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const group = await Group.update(id, { name, description });
    
    if (!group) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Group.delete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    res.json({ message: 'Grupo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

