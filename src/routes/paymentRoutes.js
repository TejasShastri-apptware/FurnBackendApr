import express from "express";
import paymentController from "../controllers/paymentController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Payment operations require an authenticated user
router.post("/create-order", injectContext, requireAuth, paymentController.createOrder);
router.get("/get-payment/:paymentId", injectContext, requireAuth, paymentController.fetchPayment);

export default router;
