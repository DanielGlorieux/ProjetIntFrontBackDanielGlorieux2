import { API_BASE_URL } from "../utils/constants";

export const api = {
  // Authentification
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  // Gestion des livres
  getBooks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/books?${queryString}`);
    return await response.json();
  },

  getBook: async (id) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    return await response.json();
  },

  addBook: async (bookData, token) => {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });
    return await response.json();
  },

  updateBook: async (id, bookData, token) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });
    return await response.json();
  },

  deleteBook: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  // Gestion des emprunts
  createLoan: async (bookId, token) => {
    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId }),
    });
    return await response.json();
  },

  returnLoan: async (loanId, token) => {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/return`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  getUserLoans: async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/loans/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  getAllLoans: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/loans?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  // Gestion des utilisateurs
  getUsers: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  updateUser: async (id, userData, token) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  },

  deleteUser: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },
};
