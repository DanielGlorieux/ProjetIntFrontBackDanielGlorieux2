import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Book,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BookModal from "../books/BookModal";
import UserManagement from "./UserManagement";
import Statistics from "./Statistics";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    genre: "",
    availability: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({});
  const [deleting, setDeleting] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const { user, token, api } = useAuth();

  const loadBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const searchParams = {
        ...filters,
        title: searchTerm,
        limit: 10,
      };
      const response = await api.getBooks(searchParams);
      if (response.books) {
        setBooks(response.books);
        setPagination(response.pagination || {});
      } else {
        setError("Erreur lors du chargement des livres");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des livres:", error);
      setError("Erreur lors du chargement des livres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "books") {
      loadBooks();
    }
  }, [activeTab, filters, searchTerm]);

  const handleAddBook = () => {
    setSelectedBook(null);
    setShowBookModal(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const handleSaveBook = async (bookData) => {
    try {
      let response;
      if (selectedBook) {
        response = await api.updateBook(selectedBook.id, bookData, token);
      } else {
        response = await api.addBook(bookData, token);
      }

      if (response.message) {
        alert(response.message);
        loadBooks();
        setShowBookModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du livre");
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
      return;
    }

    setDeleting(bookId);
    try {
      const response = await api.deleteBook(bookId, token);
      if (response.message) {
        alert(response.message);
        loadBooks();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du livre");
    } finally {
      setDeleting(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const renderBooksTab = () => (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Livres</h2>
        <button
          onClick={handleAddBook}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un livre
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rechercher par titre, auteur..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) =>
                setFilters({ ...filters, genre: e.target.value, page: 1 })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="Fiction">Fiction</option>
              <option value="Science">Science</option>
              <option value="Histoire">Histoire</option>
              <option value="Biographie">Biographie</option>
              <option value="Philosophie">Philosophie</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilité
            </label>
            <select
              value={filters.availability}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  availability: e.target.value,
                  page: 1,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="available">Disponible</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
        </form>
      </div>

      {/* Table des livres */}
      {loading ? (
        <Loading message="Chargement des livres..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadBooks} />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponibilité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          ISBN: {book.isbn || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {book.genre || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          book.quantity_available > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.quantity_available} / {book.quantity_total}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.quantity_total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          disabled={deleting === book.id}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  sur {pagination.total} résultats
                </div>
                <div className="flex space-x-2">
                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setFilters({ ...filters, page })}
                      className={`px-3 py-1 rounded text-sm ${
                        page === pagination.page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: "books", label: "Livres", icon: Book },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "statistics", label: "Statistiques", icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panneau d'Administration
        </h1>
        <p className="text-gray-600">
          Gérez les livres, utilisateurs et consultez les statistiques
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "books" && renderBooksTab()}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "statistics" && <Statistics />}
      </div>

      {/* Book Modal */}
      <BookModal
        book={selectedBook}
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        onSave={handleSaveBook}
      />
    </div>
  );
};

export default AdminPanel;
