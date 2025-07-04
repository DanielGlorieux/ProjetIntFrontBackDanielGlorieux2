const express = require("express");
const db = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// GET - Liste des livres avec filtres, tri et pagination
router.get("/", async (req, res) => {
  const {
    page = 1,
    limit = 10,
    title,
    author,
    genre,
    sortBy = "title",
    sortOrder = "ASC",
  } = req.query;

  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = "SELECT * FROM books WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as total FROM books WHERE 1=1";
    const params = [];
    const countParams = [];

    if (title) {
      query += " AND title LIKE ?";
      countQuery += " AND title LIKE ?";
      params.push(`%${title}%`);
      countParams.push(`%${title}%`);
    }

    if (author) {
      query += " AND author LIKE ?";
      countQuery += " AND author LIKE ?";
      params.push(`%${author}%`);
      countParams.push(`%${author}%`);
    }

    if (genre) {
      query += " AND genre = ?";
      countQuery += " AND genre = ?";
      params.push(genre);
      countParams.push(genre);
    }

    const allowedSortFields = [
      "title",
      "author",
      "publication_year",
      "created_at",
    ];
    const allowedSortOrders = ["ASC", "DESC"];

    if (
      allowedSortFields.includes(sortBy) &&
      allowedSortOrders.includes(sortOrder.toUpperCase())
    ) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }
    const finalQuery = `${query} LIMIT ${Number(limitNum)} OFFSET ${Number(
      offset
    )}`;
    const finalParams = [...params];

    const [books] = await db.execute(finalQuery, finalParams);
    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des livres:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des livres" });
  }
});

// GET - Détails d’un livre avec ses avis
router.get("/:id", async (req, res) => {
  try {
    const [books] = await db.execute("SELECT * FROM books WHERE id = ?", [
      req.params.id,
    ]);

    if (books.length === 0) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    const [reviews] = await db.execute(
      `SELECT r.rating, r.comment, r.created_at, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...books[0],
      reviews,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du livre:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du livre" });
  }
});

// POST - Ajouter un livre
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const {
    title,
    author,
    genre,
    isbn,
    description,
    publicationYear,
    quantityTotal = 1,
  } = req.body;

  if (!title || !author) {
    return res
      .status(400)
      .json({ message: "Le titre et l'auteur sont obligatoires" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO books 
      (title, author, genre, isbn, description, publication_year, quantity_total, quantity_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author,
        genre || null,
        isbn || null,
        description || null,
        publicationYear || null,
        parseInt(quantityTotal),
        parseInt(quantityTotal),
      ]
    );

    res.status(201).json({
      message: "Livre ajouté avec succès",
      book: {
        id: result.insertId,
        title,
        author,
        genre: genre || null,
        isbn: isbn || null,
        description: description || null,
        publication_year: publicationYear || null,
        quantity_total: parseInt(quantityTotal),
        quantity_available: parseInt(quantityTotal),
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du livre:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Un livre avec cet ISBN existe déjà" });
    }
    res.status(500).json({ message: "Erreur lors de l'ajout du livre" });
  }
});

// PUT - Mettre à jour un livre
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const {
    title,
    author,
    genre,
    isbn,
    description,
    publicationYear,
    quantityTotal,
  } = req.body;

  if (!title || !author) {
    return res
      .status(400)
      .json({ message: "Le titre et l'auteur sont obligatoires" });
  }

  try {
    const [result] = await db.execute(
      `UPDATE books SET 
       title = ?, author = ?, genre = ?, isbn = ?, 
       description = ?, publication_year = ?, quantity_total = ?
       WHERE id = ?`,
      [
        title,
        author,
        genre || null,
        isbn || null,
        description || null,
        publicationYear || null,
        parseInt(quantityTotal),
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.json({ message: "Livre mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du livre:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du livre" });
  }
});

// DELETE - Supprimer un livre (si pas d'emprunts actifs)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [activeLoans] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM loans 
       WHERE book_id = ? AND status = "active"`,
      [req.params.id]
    );

    if (activeLoans[0].count > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer ce livre, il y a des emprunts actifs",
      });
    }

    const [result] = await db.execute("DELETE FROM books WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du livre:", error);
    res.status(500).json({ message: "Erreur lors de la suppression du livre" });
  }
});

// GET - Liste des genres disponibles
router.get("/genres/list", async (req, res) => {
  try {
    const [genres] = await db.execute(
      "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre"
    );
    res.json(genres.map((g) => g.genre));
  } catch (error) {
    console.error("Erreur lors de la récupération des genres:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des genres" });
  }
});

module.exports = router;
