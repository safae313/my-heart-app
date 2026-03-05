const checkRole = (...rolesAutorisés) => {
  return (req, res, next) => {
    const roleUtilisateur = req.user.role;

    if (!rolesAutorisés.includes(roleUtilisateur)) {
      return res.status(403).json({
        message: 'Accès refusé : vous n\'avez pas les droits'
      });
    }

    next();
  };
};

module.exports = { checkRole };