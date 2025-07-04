import React from "react";
import { BookOpen, Book, User, LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navigation = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold flex items-center">
            <BookOpen className="mr-2" />
            Bibliothèque
          </h1>
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => onPageChange("catalog")}
              className={`flex items-center px-3 py-2 rounded transition-colors ${
                currentPage === "catalog" ? "bg-blue-700" : "hover:bg-blue-700"
              }`}
            >
              <Book className="mr-1 w-4 h-4" />
              Catalogue
            </button>
            <button
              onClick={() => onPageChange("dashboard")}
              className={`flex items-center px-3 py-2 rounded transition-colors ${
                currentPage === "dashboard"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              <User className="mr-1 w-4 h-4" />
              Mon Compte
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => onPageChange("admin")}
                className={`flex items-center px-3 py-2 rounded transition-colors ${
                  currentPage === "admin" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <BarChart3 className="mr-1 w-4 h-4" />
                Administration
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            Bonjour, {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <LogOut className="mr-1 w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
