// Statuts possibles pour un rendez-vous
const AppointmentStatus = {
    PENDING: 'en_attente',
    CONFIRMED: 'confirmé',
    CANCELLED: 'annulé',
    COMPLETED: 'terminé'
};

// Rôles des utilisateurs (copié du service Auth pour cohérence)
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
    APPOINTMENT_NOT_FOUND: 'Rendez-vous non trouvé',
    PATIENT_NOT_FOUND: 'Patient non trouvé',
    MEDECIN_NOT_FOUND: 'Médecin non trouvé',
    SLOT_UNAVAILABLE: 'Créneau non disponible',
    APPOINTMENT_CONFLICT: 'Conflit de rendez-vous'
};

module.exports = {
    AppointmentStatus,
    UserRole,
    ErrorMessages
};