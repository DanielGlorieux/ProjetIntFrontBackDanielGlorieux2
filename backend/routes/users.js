const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

/* import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import db from "../config/database.js";
import express from "express";
import bcrypt from "bcryptjs"; */

const router = express.Router();

// Lister tous les utilisateurs (admin seulement)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    const limitValue = Number(limitNum);
    const offsetValue = Number(offset);

    const query = `
      SELECT id, email, first_name, last_name, student_id, role, created_at,
             (SELECT COUNT(*) FROM loans WHERE user_id = users.id AND status = 'active') as active_loans
      FROM users
      WHERE 1=1
      ORDER BY created_at DESC
      LIMIT ${limitValue} OFFSET ${offsetValue}
    `;

    const [users] = await db.execute(query);

    const [countResult] = await db.execute(
      "SELECT COUNT(*) as total FROM users"
    );

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
});

// Obtenir un utilisateur spécifique
router.get("/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;

  // Vérifier que l'utilisateur peut voir ces informations
  if (parseInt(userId) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès non autorisé" });
  }

  try {
    const [users] = await db.execute(
      `
            SELECT id, email, first_name, last_name, student_id, role, created_at,
                   (SELECT COUNT(*) FROM loans WHERE user_id = users.id AND status = 'active') as active_loans,
                   (SELECT COUNT(*) FROM loans WHERE user_id = users.id) as total_loans
            FROM users
            WHERE id = ?
        `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
});

// Modifier un utilisateur
router.put("/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  const { email, firstName, lastName, studentId, role } = req.body;

  // Vérifier que l'utilisateur peut modifier ces informations
  if (parseInt(userId) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès non autorisé" });
  }

  // Seul un admin peut modifier le rôle
  if (role && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Seul un administrateur peut modifier le rôle" });
  }

  try {
    // Vérifier si l'email existe déjà pour un autre utilisateur
    if (email) {
      const [existingUsers] = await db.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    // Vérifier si l'ID étudiant existe déjà pour un autre utilisateur
    if (studentId) {
      const [existingStudents] = await db.execute(
        "SELECT id FROM users WHERE student_id = ? AND id != ?",
        [studentId, userId]
      );
      if (existingStudents.length > 0) {
        return res
          .status(400)
          .json({ message: "Cet ID étudiant est déjà utilisé" });
      }
    }

    // Construire la requête de mise à jour
    let updateFields = [];
    let updateValues = [];

    if (email) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }
    if (firstName) {
      updateFields.push("first_name = ?");
      updateValues.push(firstName);
    }
    if (lastName) {
      updateFields.push("last_name = ?");
      updateValues.push(lastName);
    }
    if (studentId) {
      updateFields.push("student_id = ?");
      updateValues.push(studentId);
    }
    if (role && req.user.role === "admin") {
      updateFields.push("role = ?");
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    updateValues.push(userId);

    const [result] = await db.execute(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    // Vérifier s'il y a des emprunts actifs
    const [activeLoans] = await db.execute(
      'SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status = "active"',
      [userId]
    );

    if (activeLoans[0].count > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer cet utilisateur, il a des emprunts actifs",
      });
    }

    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

// Changer le mot de passe
router.put("/:id/password", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  // Vérifier que l'utilisateur peut modifier ce mot de passe
  if (parseInt(userId) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès non autorisé" });
  }

  try {
    // Si ce n'est pas un admin, vérifier le mot de passe actuel
    if (req.user.role !== "admin") {
      const [users] = await db.execute(
        "SELECT password FROM users WHERE id = ?",
        [userId]
      );
      if (users.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const isValidPassword = await bcrypt.compare(
        currentPassword,
        users[0].password
      );
      if (!isValidPassword) {
        return res
          .status(400)
          .json({ message: "Mot de passe actuel incorrect" });
      }
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du mot de passe" });
  }
});

// Obtenir les statistiques des utilisateurs (admin seulement)
router.get(
  "/stats/overview",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                COUNT(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 END) as new_users_last_month
            FROM users
        `);

      const [loanStats] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_loans,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_loans,
                COUNT(CASE WHEN DATE(loan_date) = CURRENT_DATE THEN 1 END) as loans_today
            FROM loans
        `);

      res.json({
        users: stats[0],
        loans: loanStats[0],
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des statistiques" });
    }
  }
);

module.exports = router;
