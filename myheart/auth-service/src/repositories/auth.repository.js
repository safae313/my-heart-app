const  User = require('../models/user');

const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const findById = async (id) => {
  return await User.findOne({ where: { id } });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

module.exports = {
  findByEmail,
  findById,
  createUser,
};