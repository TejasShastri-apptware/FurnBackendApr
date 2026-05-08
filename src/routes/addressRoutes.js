import express from 'express';
const router = express.Router();
import addressController from "../controllers/AddressController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAuth } from "../middleware/authMiddleware.js";

// All address operations require an authenticated user
router.get("/user/:user_id", injectContext, requireAuth, addressController.getUserAddresses);
router.post("/", injectContext, requireAuth, addressController.addAddress);
router.put("/set-default/:address_id", injectContext, requireAuth, addressController.setDefaultAddress);
router.put("/:address_id", injectContext, requireAuth, addressController.updateAddress);
router.delete("/:address_id", injectContext, requireAuth, addressController.deleteAddress);

export default router;