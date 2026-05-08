import express from 'express';
const router = express.Router();
import cartController from "../controllers/CartController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAuth } from "../middleware/authMiddleware.js";

// All cart operations require an authenticated user
router.get("/", injectContext, requireAuth, cartController.getCart);
router.post("/add", injectContext, requireAuth, cartController.addToCart);
router.put("/update/:cart_item_id", injectContext, requireAuth, cartController.updateCartQuantity);
router.delete("/remove/:cart_item_id", injectContext, requireAuth, cartController.removeFromCart);

export default router;