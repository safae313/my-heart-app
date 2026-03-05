// Statuts possibles pour une ordonnance
const OrdonnanceStatus = {
    ACTIVE: 'active',
    EXPIREE: 'expirée',
    UTILISEE: 'utilisée'
};

// Rôles des utilisateurs (copié du service Rendez-vous pour cohérence)
const UserRole = {
    PATIENT: 'patient',
    MEDECIN: 'medecin',
    PHARMACIEN: 'pharmacien',
    LABORANTIN: 'laborantin',
    ADMIN: 'admin'
};

// Messages d'erreur standardisés
const ErrorMessages = {
    UNAUTHORIZED: 'Non autorisé',
    FORBIDDEN: 'Accès interdit',
    NOT_FOUND: 'Ressource non trouvée',
    INVALID_DATA: 'Données invalides',
    ORDONNANCE_NOT_FOUND: 'Ordonnance non trouvée',
    FORBIDDEN_OPERATION: 'Opération interdite'
};

module.exports = {
    OrdonnanceStatus,
    UserRole,
    ErrorMessages
};