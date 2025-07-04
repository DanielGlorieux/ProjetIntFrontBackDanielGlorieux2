import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const BookModal = ({ book, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    description: "",
    publication_year: "",
    quantity_total: "",
    quantity_available: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        genre: book.genre || "",
        isbn: book.isbn || "",
        description: book.description || "",
        publication_year: book.publication_year || "",
        quantity_total: book.quantity_total || "",
        quantity_available: book.quantity_available || "",
      });
    } else {
      setFormData({
        title: "",
        author: "",
        genre: "",
        isbn: "",
        description: "",
        publication_year: "",
        quantity_total: "",
        quantity_available: "",
      });
    }
    setErrors({});
  }, [book, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    }

    if (!formData.author.trim()) {
      newErrors.author = "L'auteur est requis";
    }

    if (!formData.quantity_total || formData.quantity_total < 1) {
      newErrors.quantity_total = "La quantité totale doit être supérieure à 0";
    }

    if (!formData.quantity_available || formData.quantity_available < 0) {
      newErrors.quantity_available =
        "La quantité disponible ne peut pas être négative";
    }

    if (
      parseInt(formData.quantity_available) > parseInt(formData.quantity_total)
    ) {
      newErrors.quantity_available =
        "La quantité disponible ne peut pas être supérieure à la quantité totale";
    }

    if (
      formData.publication_year &&
      (formData.publication_year < 1000 ||
        formData.publication_year > new Date().getFullYear())
    ) {
      newErrors.publication_year = "Année de publication invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const bookData = {
        ...formData,
        publication_year: formData.publication_year
          ? parseInt(formData.publication_year)
          : null,
        quantity_total: parseInt(formData.quantity_total),
        quantity_available: parseInt(formData.quantity_available),
      };

      await onSave(bookData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {book ? "Modifier le livre" : "Ajouter un livre"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Titre du livre"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auteur *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.author ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nom de l'auteur"
              />
              {errors.author && (
                <p className="text-red-500 text-sm mt-1">{errors.author}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Science">Science</option>
                <option value="Histoire">Histoire</option>
                <option value="Biographie">Biographie</option>
                <option value="Philosophie">Philosophie</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Science-Fiction">Science-Fiction</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ISBN du livre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année de publication
              </label>
              <input
                type="number"
                name="publication_year"
                value={formData.publication_year}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.publication_year ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Année"
                min="1000"
                max={new Date().getFullYear()}
              />
              {errors.publication_year && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.publication_year}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité totale *
              </label>
              <input
                type="number"
                name="quantity_total"
                value={formData.quantity_total}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity_total ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nombre total d'exemplaires"
                min="1"
              />
              {errors.quantity_total && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.quantity_total}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité disponible *
              </label>
              <input
                type="number"
                name="quantity_available"
                value={formData.quantity_available}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity_available
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Nombre d'exemplaires disponibles"
                min="0"
              />
              {errors.quantity_available && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.quantity_available}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du livre (optionnel)"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Sauvegarde..." : book ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;
