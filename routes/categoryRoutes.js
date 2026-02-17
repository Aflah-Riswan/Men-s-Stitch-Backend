import express from 'express';
import { admin, protect } from '../middlewares/authMiddleware.js';
import {
  createCategory,
  getAllCategories,
  toggleIsList,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import validateCategory from '../middlewares/validateCategory.js'; 

const router = express.Router();

// router.post('/', protect, admin, validateCategory, createCategory);
router.get('/',getAllCategories);
// router.patch('/:id/toggle', protect, admin, toggleIsList);
// router.get('/:slug/edit', protect, admin, getCategoryBySlug);
// router.put('/:slug/edit', protect, admin, validateCategory, updateCategory);
// router.patch('/:id/delete', protect, admin, deleteCategory);

export default router;