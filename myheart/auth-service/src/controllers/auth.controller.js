const authService = require('../services/auth.service');
const register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone } = req.body;
    
    const user = await authService.register({
      nom, prenom, email, motDePasse, telephone
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      user
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

const createStaff = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role, hospital_id } = req.body;

    const user = await authService.createStaff({
      nom, prenom, email, motDePasse, role, hospital_id
    });

    res.status(201).json({
      message: 'Compte staff créé avec succès',
      user
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const { token, user } = await authService.login({ email, motDePasse });

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user
    });
  } catch (error) {
    res.status(401).json({
      message: error.message
    });
  }
};
const logout = async (req, res) => {
  res.status(200).json({
    message: 'Déconnexion réussie'
  });
};

const me = async (req, res) => {
  try {
    const user = await authService.me(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = { register, createStaff, login, logout, me };