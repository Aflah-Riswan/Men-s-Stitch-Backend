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

router.post('/', protect, admin, validateProduct, createProduct);
router.get('/', protect, getProducts);
router.get('/products-home', getProductsHome);
router.patch('/:id/toggle', protect, admin, productToggleIsList);
router.get('/:id/edit', protect, admin, getProductById);
router.put('/:id/edit', protect, admin, updateProduct);
router.patch('/:id/delete', protect, admin, deleteProduct);
router.get('/:id/details', getProductByIdHome);
router.get('/category/:slug', getProductsByCategory);


export default router;