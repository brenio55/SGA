import Company from '../models/Company.js';

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, logo_base64 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório' });
    }

    const company = await Company.create({ name, logo_base64 });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_base64 } = req.body;

    const company = await Company.update(id, { name, logo_base64 });
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Company.delete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

