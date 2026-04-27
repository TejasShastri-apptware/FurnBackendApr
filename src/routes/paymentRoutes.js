import express from "express";
import paymentController from "../controllers/paymentController.js";
import injectContext from "../middleware/injectContext.js";

const router = express.Router();

// Protected routes using injectContext (to ensure user/org identity if needed)
router.post("/create-order", injectContext, paymentController.createOrder);
router.get("/get-payment/:paymentId", injectContext, paymentController.fetchPayment);

export default router;
