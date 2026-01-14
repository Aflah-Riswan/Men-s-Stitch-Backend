
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
import { getTransactions } from '../controllers/transactionController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard-stats', getDashboardStats);

router.get('/users', getUsers);
router.get('/users/analytics', getCustomerAnalytics);
router.patch('/users/:id/block', blockUser);

router.get('/products', getProducts);
router.post('/products', createProduct);
router.get('/products/:id', getProductById); 
router.put('/products/:id', updateProduct);
router.patch('/products/:id/toggle', productToggleIsList);
router.patch('/products/:id/delete', deleteProduct);


router.post('/categories', createCategory);
router.get('/categories/:slug', getCategoryBySlug);
router.put('/categories/:slug', updateCategory);
router.patch('/categories/:id/toggle', toggleIsList);
router.patch('/categories/:id/delete', deleteCategory);


router.get('/orders', getAllOrders);
router.get('/orders/stats', getOrderStats);
router.get('/orders/:orderId', orderDetailsAdmin);
router.put('/orders/status/:orderId', updateOrderStatus);
router.put('/orders/item-status/:orderId', updateOrderItemStatus);


router.post('/coupons', addCoupon);
router.get('/coupons/:couponId', getCouponById);
router.put('/coupons/:couponId', updateCoupon);
router.get('/coupons', getCoupons);
router.patch('/coupons/:couponId/status', updateIsActive);
router.patch('/coupons/:couponId/delete', deleteCoupon);

router.get('/sales/report', getSalesReport);

router.get('/transactions' , getTransactions)

export default router;