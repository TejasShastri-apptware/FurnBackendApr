import express from 'express';
const router = express.Router();
import productController from "../controllers/ProductController.js";
import injectContext from "../middleware/injectContext.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

// NOTE: Route order matters — specific paths before /:id to avoid shadowing.
// Global routes first so they aren't caught by /:id
router.get("/global/all", productController.getAllProductsGlobal);

// Public browsing — guests and logged-in users
router.get("/", injectContext, productController.getAllProductsUnderOrg);
router.get("/search", injectContext, productController.searchProduct);
router.get("/tags", injectContext, productController.getProductByTags); // ?tags=1,2
router.get("/:id", injectContext, productController.getProductByIdUnderOrg);
router.get("/:id/tags", injectContext, productController.getProductTags);
router.get("/:id/images", injectContext, productController.getProductImages);

// Admin-only management
router.post("/with-tags", injectContext, requireAdmin, productController.createProductWithTags);
router.post("/", injectContext, requireAdmin, productController.createProductWithTags);
router.put("/updateStock/:id", injectContext, requireAdmin, productController.updateStock);
router.put("/:id", injectContext, requireAdmin, productController.updateProduct);
router.delete("/:id", injectContext, requireAdmin, productController.deleteProduct);

router.post("/:id/tags", injectContext, requireAdmin, productController.addTagToProduct);
router.delete("/:id/tags/:tag_id", injectContext, requireAdmin, productController.removeTagFromProduct);

// Product image management — admin only
router.post("/:id/images", injectContext, requireAdmin, productController.addProductImage);
router.put("/:id/images/:image_id/set-primary", injectContext, requireAdmin, productController.setPrimaryImage);
router.delete("/:id/images/:image_id", injectContext, requireAdmin, productController.deleteProductImage);

export default router;