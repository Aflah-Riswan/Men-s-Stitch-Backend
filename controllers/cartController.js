import * as cartService from '../services/cartService.js'

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updatedCart = await cartService.addToCart(userId, req.body);
    return res.status(200).json({ success: true, message: "Added to cart", cart: updatedCart });
  } catch (error) {
    next(error);
  }
};


export const getCartItems = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cart = await cartService.getCartItems(userId);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};


export const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId, action } = req.body; 
    const updatedCart = await cartService.updateQuantity(userId, itemId, action);
    return res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const updatedCart = await cartService.removeItem(userId, itemId);
    return res.status(200).json({ success: true, message: "Item removed", cart: updatedCart });
  } catch (error) {
    next(error);
  }
};


export const applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { couponCode } = req.body;
    
    if(!couponCode) throw new Error("Coupon code is required");

    const updatedCart = await cartService.applyCoupon(userId, couponCode);
    return res.status(200).json({ success: true, message: "Coupon applied successfully", cart: updatedCart });
  } catch (error) {
    next(error);
  }
};


export const removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updatedCart = await cartService.removeCoupon(userId);
    return res.status(200).json({ success: true, message: "Coupon removed", cart: updatedCart });
  } catch (error) {
    next(error);
  }
};