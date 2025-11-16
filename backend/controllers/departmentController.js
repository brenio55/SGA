import Department from '../models/Department.js';

export const getAllDepartments = async (req, res) => {
  try {
    const { company_id } = req.query;
    const departments = await Department.findAll(company_id);
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({ error: 'Departamento não encontrado' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { company_id, name, color } = req.body;

    if (!company_id || !name) {
      return res.status(400).json({ error: 'company_id e name são obrigatórios' });
    }

    const department = await Department.create({ company_id, name, color });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const department = await Department.update(id, { name, color });
    
    if (!department) {
      return res.status(404).json({ error: 'Departamento não encontrado' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Department.delete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Departamento não encontrado' });
    }

    res.json({ message: 'Departamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

