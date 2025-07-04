import React, { useState, useEffect } from "react";
import {
  Book,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const Statistics = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueLoans: 0,
    availableBooks: 0,
    totalLoans: 0,
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token, api } = useAuth();

  const loadStatistics = async () => {
    setLoading(true);
    setError("");

    try {
      // Charger les statistiques des livres
      const booksResponse = await api.getBooks({ limit: 1000 });
      const books = booksResponse.books || [];

      // Charger les utilisateurs
      const usersResponse = await api.getUsers(token, { limit: 1000 });
      const users = usersResponse.users || [];

      // Charger les emprunts
      const loansResponse = await api.getAllLoans(token, { limit: 1000 });
      const loans = loansResponse.loans || [];

      // Calculer les statistiques
      const totalBooks = books.length;
      const availableBooks = books.reduce(
        (sum, book) => sum + book.quantity_available,
        0
      );
      const totalUsers = users.length;
      const activeLoans = loans.filter(
        (loan) => loan.status === "active"
      ).length;
      const overdueLoans = loans.filter(
        (loan) => loan.status === "overdue"
      ).length;
      const totalLoans = loans.length;

      setStats({
        totalBooks,
        totalUsers,
        activeLoans,
        overdueLoans,
        availableBooks,
        totalLoans,
      });

      // Garder seulement les 5 emprunts les plus récents
      const sortedLoans = loans
        .sort((a, b) => new Date(b.loan_date) - new Date(a.loan_date))
        .slice(0, 5);
      setRecentLoans(sortedLoans);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "returned":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Actif";
      case "returned":
        return "Retourné";
      case "overdue":
        return "En retard";
      default:
        return status;
    }
  };

  if (loading) {
    return <Loading message="Chargement des statistiques..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadStatistics} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
        <button
          onClick={loadStatistics}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Actualiser
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total des livres
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBooks}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Livres disponibles
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.availableBooks}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Book className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Emprunts actifs
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeLoans}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Emprunts en retard
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overdueLoans}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total emprunts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalLoans}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Emprunts récents */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Emprunts récents
          </h3>
        </div>

        {recentLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'emprunt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.author}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {loan.first_name} {loan.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{loan.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(loan.loan_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(loan.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          loan.status
                        )}`}
                      >
                        {getStatusText(loan.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            Aucun emprunt récent
          </div>
        )}
      </div>

      {/* Résumé rapide */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">
              Taux d'occupation:{" "}
              {stats.totalBooks > 0
                ? Math.round(
                    (stats.totalBooks * 100 - stats.availableBooks * 100) /
                      stats.totalBooks
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Utilisateurs actifs: {stats.activeLoans} sur {stats.totalUsers}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Emprunts en retard: {stats.overdueLoans} sur {stats.activeLoans}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Livres par utilisateur:{" "}
              {stats.totalUsers > 0
                ? (stats.totalBooks / stats.totalUsers).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
