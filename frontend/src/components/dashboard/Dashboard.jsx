import React, { useState, useEffect } from "react";
import {
  Book,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LoanManagement from "../loans/LoanManagement";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    active: 0,
    returned: 0,
    overdue: 0,
    total: 0,
  });
  const [returningLoan, setReturningLoan] = useState(null);

  const { user, token, api } = useAuth();

  const loadUserLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getUserLoans(user.id, token);
      if (Array.isArray(response)) {
        setLoans(response);

        // Calculer les statistiques
        const now = new Date();
        const statistics = response.reduce(
          (acc, loan) => {
            acc.total++;
            if (loan.status === "active") {
              acc.active++;
              if (new Date(loan.due_date) < now) {
                acc.overdue++;
              }
            } else if (loan.status === "returned") {
              acc.returned++;
            }
            return acc;
          },
          { active: 0, returned: 0, overdue: 0, total: 0 }
        );

        setStats(statistics);
      } else {
        setError("Erreur lors du chargement des emprunts");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des emprunts:", error);
      setError("Erreur lors du chargement des emprunts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserLoans();
  }, [user.id, token]);

  const handleReturnBook = async (loanId) => {
    setReturningLoan(loanId);
    try {
      const response = await api.returnLoan(loanId, token);
      if (response.message) {
        alert(response.message);
        loadUserLoans(); // Recharger les emprunts
      } else {
        alert("Erreur lors du retour du livre");
      }
    } catch (error) {
      console.error("Erreur lors du retour du livre:", error);
      alert("Erreur lors du retour du livre");
    } finally {
      setReturningLoan(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Book className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Emprunts actifs
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Livres retournés
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.returned}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overdue}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total emprunts
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emprunts actifs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Emprunts en cours
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <Loading message="Chargement des emprunts..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={loadUserLoans} />
          ) : (
            <div className="space-y-4">
              {loans.filter((loan) => loan.status === "active").length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun emprunt en cours
                </p>
              ) : (
                loans
                  .filter((loan) => loan.status === "active")
                  .map((loan) => (
                    <div
                      key={loan.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {loan.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            par {loan.author}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              Emprunté le {formatDate(loan.loan_date)}
                            </div>
                            <div
                              className={`flex items-center text-sm ${
                                isOverdue(loan.due_date)
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              {isOverdue(loan.due_date) ? (
                                <span className="font-medium">
                                  En retard de{" "}
                                  {Math.abs(getDaysUntilDue(loan.due_date))}{" "}
                                  jour(s)
                                </span>
                              ) : (
                                <span>
                                  À rendre dans {getDaysUntilDue(loan.due_date)}{" "}
                                  jour(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleReturnBook(loan.id)}
                            disabled={returningLoan === loan.id}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              returningLoan === loan.id
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {returningLoan === loan.id ? (
                              <div className="flex items-center">
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Retour...
                              </div>
                            ) : (
                              "Retourner"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Historique des emprunts
        </h3>
      </div>
      <div className="p-6">
        {loading ? (
          <Loading message="Chargement de l'historique..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadUserLoans} />
        ) : (
          <div className="space-y-4">
            {loans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun emprunt dans l'historique
              </p>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {loan.title}
                      </h4>
                      <p className="text-sm text-gray-600">par {loan.author}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          Emprunté le {formatDate(loan.loan_date)}
                        </div>
                        {loan.return_date && (
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Retourné le {formatDate(loan.return_date)}
                          </div>
                        )}
                        {loan.status === "active" && (
                          <div
                            className={`flex items-center text-sm ${
                              isOverdue(loan.due_date)
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            {isOverdue(loan.due_date) ? (
                              <span className="font-medium">En retard</span>
                            ) : (
                              <span>
                                À rendre le {formatDate(loan.due_date)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          loan.status === "active"
                            ? isOverdue(loan.due_date)
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {loan.status === "active"
                          ? isOverdue(loan.due_date)
                            ? "En retard"
                            : "Actif"
                          : "Retourné"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Aperçu", icon: Eye },
    { id: "history", label: "Historique", icon: Calendar },
    { id: "loans", label: "Gestion des emprunts", icon: Book },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord - {user.firstName} {user.lastName}
        </h1>
        <p className="text-gray-600">
          Gérez vos emprunts et consultez votre historique
        </p>
      </div>

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

      <div>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "history" && renderHistory()}
        {activeTab === "loans" && <LoanManagement />}
      </div>
    </div>
  );
};

export default Dashboard;
