import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navigation from "./components/common/Navigation";
import Loading from "./components/common/Loading";
import LoginForm from "./components/auth/LoginForm";
import BookCatalog from "./components/books/BookCatalog";
import Dashboard from "./components/dashboard/Dashboard";
import AdminPanel from "./components/admin/AdminPanel";
import "./App.css";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("catalog");

  if (loading) {
    return <Loading message="Chargement de l'application..." />;
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "catalog":
        return <BookCatalog />;
      case "dashboard":
        return <Dashboard />;
      case "admin":
        return user.role === "admin" ? <AdminPanel /> : <BookCatalog />;
      default:
        return <BookCatalog />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="py-6">{renderPage()}</main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
