import React, { useState, useEffect } from "react";
import { Search, Book } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BookCard from "./BookCard";
import BookDetails from "./BookDetails";

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    genre: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({});
  const { user, token, api } = useAuth();

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await api.getBooks(filters);
      setBooks(response.books || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error("Erreur lors du chargement des livres:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const handleLoan = async (bookId) => {
    try {
      const response = await api.createLoan(bookId, token);
      if (response.message) {
        alert(response.message);
        loadBooks();
      }
    } catch (error) {
      console.error("Erreur lors de l'emprunt:", error);
      alert("Erreur lors de l'emprunt");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  if (showDetails && selectedBook) {
    return (
      <BookDetails
        book={selectedBook}
        onBack={() => setShowDetails(false)}
        onLoan={handleLoan}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Catalogue des Livres
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) =>
                  setFilters({ ...filters, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rechercher par titre..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auteur
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) =>
                  setFilters({ ...filters, author: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rechercher par auteur..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                value={filters.genre}
                onChange={(e) =>
                  setFilters({ ...filters, genre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les genres</option>
                <option value="Fiction">Fiction</option>
                <option value="Science">Science</option>
                <option value="Histoire">Histoire</option>
                <option value="Biographie">Biographie</option>
                <option value="Philosophie">Philosophie</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des livres...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onLoan={handleLoan}
                onViewDetails={(book) => {
                  setSelectedBook(book);
                  setShowDetails(true);
                }}
                userRole={user?.role}
              />
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-8">
              <Book className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600">Aucun livre trouvé</p>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setFilters({ ...filters, page })}
                      className={`px-3 py-2 rounded ${
                        page === pagination.page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookCatalog;
