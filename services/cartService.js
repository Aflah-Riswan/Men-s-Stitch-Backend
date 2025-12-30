import Cart from "../models/cart.js";
import Product from "../models/products.js";
import Coupons from "../models/coupons.js";
import AppError from "../utils/appError.js";
import WishList from "../models/wishlist.js";

const MAX_QTY_PER_ITEM = 5;

const recalculateCart = (cart) => {
  cart.subTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

  cart.shippingFee = cart.subTotal > 1000 ? 0 : 50;

  if (cart.discount > cart.subTotal) {
    cart.discount = cart.subTotal;
  }

  cart.grandTotal = Math.max(0, (cart.subTotal + cart.shippingFee) - (cart.discount || 0));
  return cart;
};

export const getCartItems = async (userId) => {
  const cartDoc = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.productId',
      select: 'productName variants salePrice isListed isDeleted coverImages'
    });

  if (!cartDoc) return { items: [], subTotal: 0, grandTotal: 0, discount: 0 };


  let cartModified = false;
  cartDoc.items.forEach(item => {
    const product = item.productId;
    if (product && item.price !== product.salePrice) {
      item.price = product.salePrice;
      item.totalPrice = item.price * item.quantity;
      cartModified = true;
    }
  });

  if (cartModified) {
    recalculateCart(cartDoc);
    await cartDoc.save();
  }

  const cart = cartDoc.toObject();

  cart.items.forEach(item => {
    const product = item.productId;

    if (!product || !product.isListed || product.isDeleted) {
      item.isUnavailable = true;
      item.statusMessage = "Product Unavailable";
      item.image = null;
      return;
    }

    const matchedVariant = product.variants.find(
      v => v._id.toString() === item.variantId.toString()
    );


    if (matchedVariant && matchedVariant.variantImages?.length > 0) {
      item.image = matchedVariant.variantImages[0];
    } else if (product.coverImages?.length > 0) {
      item.image = product.coverImages[0];
    } else {
      item.image = null;
    }


    if (matchedVariant) {
      const currentStock = matchedVariant.stock[item.size] || 0;
      if (currentStock < item.quantity) {
        item.isUnavailable = true;
        item.statusMessage = currentStock === 0 ? "Out of Stock" : `Only ${currentStock} left`;
      }
    }

    delete item.productId.variants;
  });

  return cart;
};


export const addToCart = async (userId, cartData) => {
  const { productId, variantId, size, quantity, colorCode } = cartData;
  const qtyToAdd = Number(quantity);

  const product = await Product.findById(productId).populate('mainCategory');
  if (!product) throw new AppError('Product not found', 404);

  if (!product.isListed || product.isDeleted) {
    throw new AppError('This product is currently unavailable', 400);
  }
  if (product.mainCategory && (!product.mainCategory.isListed || product.mainCategory.isDeleted)) {
    throw new AppError(`The category '${product.mainCategory.categoryName}' is currently unavailable`, 400);
  }

  const variant = product.variants.id(variantId);
  if (!variant) throw new AppError('Selected variant not found', 404);

  const availableStock = variant.stock[size];
  if (availableStock === undefined) throw new AppError(`Size ${size} is not valid`, 400);

  if (availableStock < qtyToAdd) {
    throw new AppError(`Out of stock! Only ${availableStock} left in size ${size}`, 400);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(item =>
    item.variantId.toString() === variantId.toString() &&
    item.size === size
  );

  const price = product.salePrice;

  if (itemIndex > -1) {
    const newQty = cart.items[itemIndex].quantity + qtyToAdd;
    if (newQty > MAX_QTY_PER_ITEM) throw new AppError(`Limit exceeded! Max ${MAX_QTY_PER_ITEM} per item.`, 400);
    if (newQty > availableStock) throw new AppError(`Cannot add more. Only ${availableStock} in stock.`, 400);
    cart.items[itemIndex].quantity = newQty;
    cart.items[itemIndex].totalPrice = newQty * price;
  } else {
    if (qtyToAdd > MAX_QTY_PER_ITEM) throw new AppError(`Limit exceeded! Max ${MAX_QTY_PER_ITEM} per item.`, 400);
    cart.items.push({
      productId, variantId, colorCode, size, quantity: qtyToAdd, price, totalPrice: price * qtyToAdd
    });
  }

  recalculateCart(cart);
  await cart.save();

  await WishList.findOneAndUpdate(
    { user: userId },
    {
      $pull: {
        products: { productId: productId }
      }
    }
  );
  return await getCartItems(userId);
};


export const updateQuantity = async (userId, itemId, action) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.id(itemId);
  if (!item) throw new AppError('Item not found', 404);

  const product = await Product.findById(item.productId);
  const variant = product.variants.id(item.variantId);
  const stock = variant.stock[item.size];

  if (action === 'increment') {
    if (item.quantity >= MAX_QTY_PER_ITEM) throw new AppError(`Max limit of ${MAX_QTY_PER_ITEM} reached`, 400);
    if (item.quantity >= stock) throw new AppError('Stock limit reached', 400);
    item.quantity++;
  } else if (action === 'decrement') {
    if (item.quantity > 1) item.quantity--;
  }

  item.totalPrice = item.quantity * item.price;

  recalculateCart(cart);
  await cart.save();
  return await getCartItems(userId);
};


export const removeItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.items = cart.items.filter(item => item._id.toString() !== itemId.toString());

  recalculateCart(cart);
  await cart.save();
  return await getCartItems(userId);
};


export const applyCoupon = async (userId, couponCode) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  const coupon = await Coupons.findOne({ couponCode: couponCode.toUpperCase(), isDeleted: false });

  if (!coupon) throw new AppError('Invalid Coupon Code', 400);

  if (!coupon.isActive) throw new AppError('This coupon is inactive', 400);
  if (new Date(coupon.expiryDate) < new Date()) throw new AppError('This coupon has expired', 400);
  if (cart.subTotal < coupon.minPurchaseAmount) throw new AppError(`Minimum purchase amount of ₹${coupon.minPurchaseAmount} required`, 400);
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached', 400);

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (cart.subTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'flat') {
    discountAmount = coupon.discountValue;
  }

  cart.couponCode = coupon.couponCode;
  cart.couponId = coupon._id;
  cart.discount = Math.round(discountAmount);

  recalculateCart(cart);
  await cart.save();
  return await getCartItems(userId);
};


export const removeCoupon = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.couponCode = null;
  cart.couponId = null;
  cart.discount = 0;

  recalculateCart(cart);
  await cart.save();
  return await getCartItems(userId);
};