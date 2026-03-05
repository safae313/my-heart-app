const UserRole = {
    PATIENT: 'patient',
    MEDECIN: 'medecin',
    PHARMACIEN: 'pharmacien',
    LABORANTIN: 'laborantin',
    ADMIN: 'admin'
};

const ErrorMessages = {
    UNAUTHORIZED: 'Non autorisé',
    FORBIDDEN: 'Accès interdit - admin requis',
    NOT_FOUND: 'Ressource non trouvée',
    INVALID_DATA: 'Données invalides'
};

module.exports = { UserRole, ErrorMessages };