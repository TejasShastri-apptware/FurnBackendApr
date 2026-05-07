import express from 'express';
const router = express.Router();
import userController from "../controllers/userController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

// Self-service profile (logged-in user)
router.get("/me", injectContext, requireAuth, userController.getMe);
router.put("/me", injectContext, requireAuth, userController.updateMe);

// Auth
router.post("/login", injectContext, userController.login);
router.post("/register", injectContext, userController.createUser);

// Org-scoped (admin use)
router.get("/org", injectContext, requireAdmin, userController.getAllUsersUnderOrg);
router.get("/org/:id", injectContext, requireAdmin, userController.getUserByIdUnderOrg);
router.put("/org/:id", injectContext, requireAdmin, userController.updateUser);
router.delete("/org/:id", injectContext, requireAdmin, userController.deleteUser);

// Global routes — no tenant scoping needed
router.get("/global", injectContext, requireAdmin, userController.getAllUsers);
router.get("/global/:id", injectContext, requireAdmin, userController.getUserById);

export default router;