import express from 'express';
const router = express.Router();
import orderController from "../controllers/OrderController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

// Customer — requires login
router.post("/place", injectContext, requireAuth, orderController.placeOrder);
router.get("/my-history", injectContext, requireAuth, orderController.getUserOrdersByOrg);
router.get("/my-detailed-history", injectContext, requireAuth, orderController.getDetailedOrdersByUser);
router.get("/details/:order_id", injectContext, requireAuth, orderController.getDetailedOrderById);

// Admin scoped (org only)
router.get("/org-all", injectContext, requireAdmin, orderController.getAllOrdersByOrg);
router.patch("/:order_id/status", injectContext, requireAdmin, orderController.updateOrderStatus);

// Global — internal/admin only
router.get("/global-all", injectContext, requireAdmin, orderController.getAllOrders);

export default router;