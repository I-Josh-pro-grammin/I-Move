import express from "express";
import { register, login, updateLocation, logout } from "../controllers/authController.js";
import { authenticate, authorizeAdmin } from "../midelwares/Authentication.js";
import { deleteUser, getUsers } from "../controllers/AdminController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.put("/location", authenticate, updateLocation);
router.post("/logout", authenticate, logout);

// Admin routes
router.get('/', authenticate, authorizeAdmin, getUsers);
router.delete('/:userId', authenticate, authorizeAdmin, deleteUser);

export default router;
