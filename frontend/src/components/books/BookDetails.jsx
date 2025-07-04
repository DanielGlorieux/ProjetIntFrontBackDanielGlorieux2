import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

const BookDetails = ({ book, onBack, onLoan }) => {
  const [loading, setLoading] = useState(false);

  const handleLoan = async () => {
    setLoading(true);
    try {
      await onLoan(book.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Retour au catalogue
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">par {book.author}</p>

            <div className="space-y-2 mb-6">
              {book.genre && (
                <p>
                  <span className="font-medium">Genre:</span> {book.genre}
                </p>
              )}
              {book.isbn && (
                <p>
                  <span className="font-medium">ISBN:</span> {book.isbn}
                </p>
              )}
              {book.publication_year && (
                <p>
                  <span className="font-medium">Année de publication:</span>{" "}
                  {book.publication_year}
                </p>
              )}
              <p>
                <span className="font-medium">Disponibilité:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-sm ${
                    book.quantity_available > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {book.quantity_available}/{book.quantity_total} exemplaires
                </span>
              </p>
            </div>

            {book.quantity_available > 0 && (
              <button
                onClick={handleLoan}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Chargement..." : "Emprunter ce livre"}
              </button>
            )}
          </div>

          <div>
            {book.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
