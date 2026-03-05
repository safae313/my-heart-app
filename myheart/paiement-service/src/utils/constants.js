const FactureStatus = {
    EMISE: 'emise',
    PAYEE: 'payee',
    PARTIELLEMENT_PAYEE: 'partiellement_payee',
    IMPAYEE: 'impayee',
    ANNULEE: 'annulee'
};

const PaiementStatus = {
    EN_ATTENTE: 'en_attente',
    REUSSI: 'reussi',
    ECHOUÉ: 'echoue',
    REMBOURSE: 'rembourse'
};

const RemboursementStatus = {
    EN_ATTENTE: 'en_attente',
    REUSSI: 'reussi',
    ECHOUÉ: 'echoue'
};

const UserRole = {
    PATIENT: 'patient',
    MEDECIN: 'medecin',
    PHARMACIEN: 'pharmacien',
    LABORANTIN: 'laborantin',
    ADMIN: 'admin'
};

const ErrorMessages = {
    INVALID_DATA: 'Données invalides',
    FORBIDDEN: 'Accès interdit',
    NOT_FOUND: 'Ressource non trouvée',
    PAYMENT_ALREADY_MADE: 'Paiement déjà effectué',
    INSUFFICIENT_AMOUNT: 'Montant insuffisant',
    OVER_REFUND: 'Remise trop élevée'
};

module.exports = { FactureStatus, PaiementStatus, RemboursementStatus, UserRole, ErrorMessages };