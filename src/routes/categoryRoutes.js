import express from 'express';
const router = express.Router();
import CategoryController from "../controllers/CategoryController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

// Public — categories are needed for browsing
router.get("/", injectContext, CategoryController.getAllCategories);
router.get("/:id", injectContext, CategoryController.getCategoryById);

// Admin only
router.post("/", injectContext, requireAdmin, CategoryController.createCat);
router.put("/:id", injectContext, requireAdmin, CategoryController.updateCategory);
router.delete("/:id", injectContext, requireAdmin, CategoryController.deleteCategory);

export default router;