import express from "express";
import WishlistController from "../controllers/WishlistController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All wishlist operations require an authenticated user
router.get("/", injectContext, requireAuth, WishlistController.getWishlist);
router.post("/add", injectContext, requireAuth, WishlistController.addToWishlist);
router.delete("/remove/:id", injectContext, requireAuth, WishlistController.removeFromWishlist);

export default router;
