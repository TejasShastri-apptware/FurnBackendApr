import express from 'express';
const router = express.Router();
import tagController from "../controllers/TagController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

router.post("/", injectContext, requireAdmin, tagController.createTag);
router.get("/org", injectContext, tagController.getOrgTags);
router.get("/global", tagController.getAllTags);

export default router;
