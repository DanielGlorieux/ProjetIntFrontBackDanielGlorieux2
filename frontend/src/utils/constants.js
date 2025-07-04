export const API_BASE_URL = "http://localhost:3001/api";

export const LOAN_DURATION_DAYS = 14;
export const MAX_LOANS_PER_USER = 3;

export const BOOK_GENRES = [
  "Fiction",
  "Science",
  "Histoire",
  "Biographie",
  "Philosophie",
  "Littérature",
  "Technologie",
  "Art",
  "Psychologie",
  "Économie",
];

export const USER_ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
};

export const LOAN_STATUS = {
  ACTIVE: "active",
  RETURNED: "returned",
  OVERDUE: "overdue",
};

export const MESSAGES = {
  SUCCESS: {
    BOOK_ADDED: "Livre ajouté avec succès",
    BOOK_UPDATED: "Livre mis à jour avec succès",
    BOOK_DELETED: "Livre supprimé avec succès",
    LOAN_CREATED: "Livre emprunté avec succès",
    LOAN_RETURNED: "Livre retourné avec succès",
    USER_UPDATED: "Utilisateur mis à jour avec succès",
    USER_DELETED: "Utilisateur supprimé avec succès",
  },
  ERROR: {
    GENERIC: "Une erreur est survenue",
    NETWORK: "Erreur de connexion au serveur",
    UNAUTHORIZED: "Accès non autorisé",
    BOOK_NOT_AVAILABLE: "Ce livre n'est pas disponible",
    MAX_LOANS_REACHED: "Limite d'emprunts atteinte",
  },
};
