// Statuts d'analyse
const AnalyseStatus = {
    EN_ATTENTE: 'en_attente',
    EN_COURS: 'en_cours',
    TERMINE: 'termine'
};

// Catégories de test
const TestCategory = {
    SANG: 'sang',
    URINE: 'urine',
    IMAGERIE: 'imagerie',
    AUTRE: 'autre'
};

// Interprétation
const Interpretation = {
    NORMAL: 'normal',
    BAS: 'bas',
    ELEVE: 'élevé',
    CRITIQUE: 'critique'
};

// Types de documents
const DocumentType = {
    PDF: 'pdf',
    IMAGE: 'image',
    AUTRE: 'autre'
};

// Rôles
const UserRole = {
    PATIENT: 'patient',
    MEDECIN: 'medecin',
    PHARMACIEN: 'pharmacien',
    LABORANTIN: 'laborantin',
    ADMIN: 'admin'
};

// Erreurs
const ErrorMessages = {
    UNAUTHORIZED: 'Non autorisé',
    FORBIDDEN: 'Accès interdit',
    NOT_FOUND: 'Ressource non trouvée',
    INVALID_DATA: 'Données invalides',
    ANALYSE_NOT_FOUND: 'Analyse non trouvée'
};

module.exports = {
    AnalyseStatus,
    TestCategory,
    Interpretation,
    DocumentType,
    UserRole,
    ErrorMessages
};