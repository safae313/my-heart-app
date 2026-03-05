const authRepository = require('../repositories/auth.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async ({ nom, prenom, email, motDePasse, telephone }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Email déjà utilisé !');
  }
  const hashedPassword = await bcrypt.hash(motDePasse, 10);
  const user = await authRepository.createUser({
    nom,
    prenom,
    email,
    motDePasse: hashedPassword,
    telephone,
    role: 'patient'
  });
  return user;
};

const createStaff = async ({ nom, prenom, email, motDePasse, telephone, role }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Email déjà utilisé !');
  }
  const hashedPassword = await bcrypt.hash(motDePasse, 10);
  const user = await authRepository.createUser({
    nom,
    prenom,
    email,
    motDePasse: hashedPassword,
    telephone,
    role
  });
  return user;
};

const login = async ({ email, motDePasse }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!isPasswordValid) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, hospital_id: user.hospital_id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { motDePasse: _, ...userSansMotDePasse } = user.toJSON();
  return { token, user: userSansMotDePasse };
};

const me = async (id) => {
  const user = await authRepository.findById(id);
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  const { motDePasse, ...userSansMotDePasse } = user.toJSON();
  return userSansMotDePasse;
};
module.exports = { register, createStaff, login, me };