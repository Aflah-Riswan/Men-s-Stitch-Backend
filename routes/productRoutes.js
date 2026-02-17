import express from 'express';
import { validateProduct } from '../middlewares/validateProducts.js';
import { 
  createProduct, 
  getProducts, 
  productToggleIsList, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  getProductsHome, 
  getProductByIdHome, 
  getProductsByCategory, 
 
} from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/products-home', getProductsHome);
router.get('/:id/details', getProductByIdHome);
router.get('/category/:slug', getProductsByCategory);


export default router;