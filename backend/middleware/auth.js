const jwt = require("jsonwebtoken");
const db = require("../config/database");

/* import jwt from "jsonwebtoken";
import db from "../config/database.js"; */

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.execute(
      "SELECT id, email, role FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(403).json({ message: "Utilisateur non trouvé" });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès administrateur requis" });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
};
