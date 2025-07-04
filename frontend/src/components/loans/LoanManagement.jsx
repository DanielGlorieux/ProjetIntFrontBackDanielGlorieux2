import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowLeft,
  Book,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({});
  const [returning, setReturning] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("all");

  const { user, token, api } = useAuth();

  const loadLoans = async () => {
    setLoading(true);
    setError("");
    try {
      let response;

      if (view === "user") {
        // Charger les emprunts de l'utilisateur connecté
        response = await api.getUserLoans(user.id, token);
        setLoans(Array.isArray(response) ? response : []);
        setPagination({});
      } else if (view === "overdue") {
        // Charger les emprunts en retard
        const overdueResponse = await fetch(
          `http://localhost:3001/api/loans/overdue`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        response = await overdueResponse.json();
        setLoans(Array.isArray(response) ? response : []);
        setPagination({});
      } else {
        // Charger tous les emprunts (admin seulement)
        const searchParams = {
          ...filters,
          limit: 10,
        };
        response = await api.getAllLoans(token, searchParams);
        if (response.loans) {
          setLoans(response.loans);
          setPagination(response.pagination || {});
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des emprunts:", error);
      setError("Erreur lors du chargement des emprunts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [filters, view]);

  const handleReturnLoan = async (loanId) => {
    if (!confirm("Êtes-vous sûr de vouloir retourner ce livre ?")) {
      return;
    }

    setReturning(loanId);
    try {
      const response = await api.returnLoan(loanId, token);
      if (response.message) {
        alert(response.message);
        loadLoans();
      }
    } catch (error) {
      console.error("Erreur lors du retour:", error);
      alert("Erreur lors du retour du livre");
    } finally {
      setReturning(null);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = status === "active" && due < now;

    if (status === "returned") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Retourné
        </span>
      );
    } else if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          En retard
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Actif
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredLoans = loans.filter((loan) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      loan.title?.toLowerCase().includes(searchLower) ||
      loan.author?.toLowerCase().includes(searchLower) ||
      loan.first_name?.toLowerCase().includes(searchLower) ||
      loan.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-64">
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
              placeholder="Rechercher par livre, auteur, utilisateur..."
            />
          </div>
        </div>

        {user.role === "admin" && view === "all" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="returned">Retourné</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );

  const renderViewSelector = () => (
    <div className="mb-6">
      <div className="flex space-x-4">
        {user.role === "admin" && (
          <button
            onClick={() => setView("all")}
            className={`px-4 py-2 rounded-md transition-colors ${
              view === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Tous les emprunts
          </button>
        )}
        <button
          onClick={() => setView("user")}
          className={`px-4 py-2 rounded-md transition-colors ${
            view === "user"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Mes emprunts
        </button>
        <button
          onClick={() => setView("overdue")}
          className={`px-4 py-2 rounded-md transition-colors ${
            view === "overdue"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          En retard
        </button>
      </div>
    </div>
  );

  const renderLoanTable = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Livre
              </th>
              {user.role === "admin" && view === "all" && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emprunteur
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'emprunt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'échéance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLoans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Book className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {loan.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        par {loan.author}
                      </div>
                    </div>
                  </div>
                </td>
                {user.role === "admin" && view === "all" && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.first_name} {loan.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.email}
                        </div>
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {formatDate(loan.loan_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    {formatDate(loan.due_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(loan.status, loan.due_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loan.status === "active" && (
                    <button
                      onClick={() => handleReturnLoan(loan.id)}
                      disabled={returning === loan.id}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {returning === loan.id ? "Retour..." : "Retourner"}
                    </button>
                  )}
                  {loan.status === "returned" && loan.return_date && (
                    <span className="text-sm text-gray-500">
                      Retourné le {formatDate(loan.return_date)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-8">
          <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun emprunt trouvé</p>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              sur {pagination.total} résultats
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des Emprunts
        </h1>
        <p className="text-gray-600">
          Consultez et gérez les emprunts de livres
        </p>
      </div>

      {renderViewSelector()}
      {renderFilters()}

      {loading ? (
        <Loading message="Chargement des emprunts..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadLoans} />
      ) : (
        renderLoanTable()
      )}
    </div>
  );
};

export default LoanManagement;
