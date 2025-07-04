const express = require("express");
const db = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

/* import db from "../config/database.js";
import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js"; */

const router = express.Router();

// Emprunter un livre
router.post("/", authenticateToken, async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  const connection = await db.getConnection(); // Récupérer une connexion depuis le pool
  try {
    await connection.query("START TRANSACTION"); // Utiliser .query() pour les commandes de transaction

    // Verrouiller le livre pour lecture exclusive
    const [bookRows] = await connection.execute(
      "SELECT quantity_available FROM books WHERE id = ? FOR UPDATE",
      [bookId]
    );

    if (bookRows.length === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (bookRows[0].quantity_available <= 0) {
      await connection.query("ROLLBACK");
      return res.status(400).json({ message: "Livre indisponible" });
    }

    // Déterminer la date de retour (14 jours plus tard)
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Insérer l’emprunt avec due_date
    await connection.execute(
      "INSERT INTO loans (user_id, book_id, status, loan_date, due_date) VALUES (?, ?, 'active', NOW(), ?)",
      [userId, bookId, dueDate]
    );

    // Mettre à jour le stock disponible
    await connection.execute(
      "UPDATE books SET quantity_available = quantity_available - 1 WHERE id = ?",
      [bookId]
    );

    await connection.query("COMMIT");
    res.json({ message: "Emprunt effectué avec succès" });
  } catch (error) {
    await connection.query("ROLLBACK");
    console.error("Erreur lors de l'emprunt:", error);
    res.status(500).json({ message: "Erreur lors de l'emprunt" });
  } finally {
    connection.release();
  }
});

// Retourner un livre
router.put("/:id/return", authenticateToken, async (req, res) => {
  const loanId = req.params.id;
  const userId = req.user.id;

  const connection = await db.getConnection();
  try {
    const [loans] = await connection.execute(
      "SELECT l.*, b.title FROM loans l JOIN books b ON l.book_id = b.id WHERE l.id = ?",
      [loanId]
    );

    if (loans.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Emprunt non trouvé" });
    }

    const loan = loans[0];

    if (loan.user_id !== userId && req.user.role !== "admin") {
      connection.release();
      return res
        .status(403)
        .json({ message: "Vous ne pouvez pas retourner ce livre" });
    }

    if (loan.status !== "active") {
      connection.release();
      return res.status(400).json({ message: "Ce livre a déjà été retourné" });
    }

    await connection.query("START TRANSACTION");

    try {
      await connection.execute(
        'UPDATE loans SET status = "returned", return_date = CURRENT_TIMESTAMP WHERE id = ?',
        [loanId]
      );

      await connection.execute(
        "UPDATE books SET quantity_available = quantity_available + 1 WHERE id = ?",
        [loan.book_id]
      );

      await connection.query("COMMIT");

      res.json({
        message: "Livre retourné avec succès",
        loan: {
          id: loanId,
          bookTitle: loan.title,
          returnDate: new Date(),
        },
      });
    } catch (error) {
      await connection.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors du retour du livre:", error);
    res.status(500).json({ message: "Erreur lors du retour du livre" });
  } finally {
    connection.release();
  }
});

// Obtenir les emprunts d'un utilisateur
router.get("/user/:userId", authenticateToken, async (req, res) => {
  const userId = req.params.userId;

  // Vérifier que l'utilisateur peut voir ces emprunts
  if (parseInt(userId) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès non autorisé" });
  }

  try {
    const [loans] = await db.execute(
      `
            SELECT l.*, b.title, b.author, b.isbn
            FROM loans l
            JOIN books b ON l.book_id = b.id
            WHERE l.user_id = ?
            ORDER BY l.loan_date DESC
        `,
      [userId]
    );

    res.json(loans);
  } catch (error) {
    console.error("Erreur lors de la récupération des emprunts:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des emprunts" });
  }
});

// Obtenir tous les emprunts (admin seulement)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  const { page = 1, limit = 10, status, userId, bookId } = req.query;

  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = `
      SELECT l.*, b.title, b.author, u.first_name, u.last_name, u.email
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM loans WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (status) {
      query += " AND l.status = ?";
      countQuery += " AND status = ?";
      params.push(status);
      countParams.push(status);
    }

    if (userId) {
      query += " AND l.user_id = ?";
      countQuery += " AND user_id = ?";
      params.push(userId);
      countParams.push(userId);
    }

    if (bookId) {
      query += " AND l.book_id = ?";
      countQuery += " AND book_id = ?";
      params.push(bookId);
      countParams.push(bookId);
    }

    const finalQuery = `${query} ORDER BY l.loan_date DESC LIMIT ${Number(
      limitNum
    )} OFFSET ${Number(offset)}`;

    const [loans] = await db.execute(finalQuery, params);
    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      loans,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des emprunts:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des emprunts" });
  }
});

// Obtenir les emprunts en retard
router.get("/overdue", authenticateToken, async (req, res) => {
  try {
    let query = `
            SELECT l.*, b.title, b.author, u.first_name, u.last_name, u.email
            FROM loans l
            JOIN books b ON l.book_id = b.id
            JOIN users u ON l.user_id = u.id
            WHERE l.due_date < CURRENT_TIMESTAMP AND l.status = 'active'
        `;

    // Si ce n'est pas un admin, ne montrer que ses propres emprunts
    if (req.user.role !== "admin") {
      query += " AND l.user_id = ?";
    }

    const params = req.user.role !== "admin" ? [req.user.id] : [];
    const [overdueLoans] = await db.execute(query, params);

    res.json(overdueLoans);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des emprunts en retard:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des emprunts en retard",
    });
  }
});

module.exports = router;
