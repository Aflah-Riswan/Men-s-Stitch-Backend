
import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';

// --- IMPORT CONTROLLERS ---
import { 
    getUsers, 
    blockUser, 
    getCustomerAnalytics 
} from '../controllers/userController.js';

import { 
    createProduct, 
    getProducts, 
    productToggleIsList, 
    getProductById, 
    updateProduct, 
    deleteProduct 
} from '../controllers/productController.js';

import {
    createCategory,
    toggleIsList,
    getCategoryBySlug,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';

import { 
    getAllOrders, 
    getOrderStats, 
    orderDetailsAdmin, 
    updateOrderStatus, 
    updateOrderItemStatus 
} from '../controllers/orderController.js';

import { 
    addCoupon, 
    deleteCoupon, 
    getCouponById, 
    getCoupons, 
    updateCoupon, 
    updateIsActive 
} from '../controllers/couponController.js';

import { getSalesReport } from '../controllers/salesController.js';

const router = express.Router();

// 🔒 GLOBAL SECURITY: All routes below need Admin Token
router.use(protect, admin);


// ==========================================
// 👥 USER MANAGEMENT
// ==========================================
router.get('/users', getUsers);
router.get('/users/analytics', getCustomerAnalytics);
router.patch('/users/:id/block', blockUser);


// ==========================================
// 📦 PRODUCT MANAGEMENT
// ==========================================
router.get('/products', getProducts);
router.post('/products', createProduct);
router.get('/products/:id', getProductById); // For Editing
router.put('/products/:id', updateProduct);
router.patch('/products/:id/toggle', productToggleIsList);
router.patch('/products/:id/delete', deleteProduct);


// ==========================================
// 🗂️ CATEGORY MANAGEMENT
// ==========================================
router.post('/categories', createCategory);
router.get('/categories/:slug', getCategoryBySlug); // For Editing
router.put('/categories/:slug', updateCategory);
router.patch('/categories/:id/toggle', toggleIsList);
router.patch('/categories/:id/delete', deleteCategory);


// ==========================================
// 🚚 ORDER MANAGEMENT
// ==========================================
router.get('/orders', getAllOrders);
router.get('/orders/stats', getOrderStats);
router.get('/orders/:orderId', orderDetailsAdmin);
router.put('/orders/status/:orderId', updateOrderStatus);
router.put('/orders/item-status/:orderId', updateOrderItemStatus);


// ==========================================
// 🎟️ COUPON MANAGEMENT
// ==========================================
router.post('/coupons', addCoupon);
router.get('/coupons/:couponId', getCouponById);
router.put('/coupons/:couponId', updateCoupon);
router.get('/coupons', getCoupons);
router.patch('/coupons/:couponId/status', updateIsActive);
router.patch('/coupons/:couponId/delete', deleteCoupon);


// ==========================================
// 📈 SALES REPORT
// ==========================================
router.get('/sales/report', getSalesReport);


export default router;