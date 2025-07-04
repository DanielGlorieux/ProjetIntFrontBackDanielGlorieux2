import React, { useState } from "react";
import { Edit2, Trash2, Eye } from "lucide-react";

const BookCard = ({
  book,
  onLoan,
  onEdit,
  onDelete,
  onViewDetails,
  userRole,
}) => {
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
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {book.title}
        </h3>
        {userRole === "admin" && (
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(book)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(book.id)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-2">par {book.author}</p>

      {book.genre && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
          {book.genre}
        </span>
      )}

      <div className="text-sm text-gray-500 mb-3">
        <p>
          Disponible: {book.quantity_available}/{book.quantity_total}
        </p>
        {book.publication_year && <p>Année: {book.publication_year}</p>}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onViewDetails(book)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          Détails
        </button>

        {book.quantity_available > 0 && (
          <button
            onClick={handleLoan}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Emprunter"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
