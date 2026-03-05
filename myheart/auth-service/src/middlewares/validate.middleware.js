const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Données invalides',
        erreurs: error.details.map(e => e.message)
      });
    }

    next();
  };
};

module.exports = { validate };