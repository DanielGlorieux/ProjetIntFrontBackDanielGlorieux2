import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_BASE_URL = "http://localhost:3001/api";

const api = {
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

  getUsers: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await api.getProfile(storedToken);
          if (profile.id) {
            setUser(profile);
          } else {
            localStorage.removeItem("token");
            setToken("");
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
          localStorage.removeItem("token");
          setToken("");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("token", response.token);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return { success: false, message: "Erreur de connexion" };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("token", response.token);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return { success: false, message: "Erreur lors de l'inscription" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, api }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, api };
