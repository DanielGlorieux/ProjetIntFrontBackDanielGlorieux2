const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

/* import { authenticateToken } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import db from "../config/database.js";
import express from "express";
import bcrypt from "bcryptjs"; */

const router = express.Router();

// Inscription
router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, studentId } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Vérifier si l'ID étudiant existe déjà
    if (studentId) {
      const [existingStudents] = await db.execute(
        "SELECT id FROM users WHERE student_id = ?",
        [studentId]
      );
      if (existingStudents.length > 0) {
        return res
          .status(400)
          .json({ message: "Cet ID étudiant est déjà utilisé" });
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const safeStudentId = studentId?.trim() || null;

    // Créer l'utilisateur
    const [result] = await db.execute(
      "INSERT INTO users (email, password, first_name, last_name, student_id) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, firstName, lastName, safeStudentId]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        studentId,
        role: "student",
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.execute(
      "SELECT id, email, password, first_name, last_name, student_id, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        studentId: user.student_id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});

// Profil utilisateur
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, email, first_name, last_name, student_id, role FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      studentId: user.student_id,
      role: user.role,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil" });
  }
});

module.exports = router;
