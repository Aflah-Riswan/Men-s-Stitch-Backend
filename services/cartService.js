import Cart from "../models/cart.js"
import User from "../models/users.js"
import AppError from "../utils/appError.js"

export const addToCart = async (userId, cartData) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User is not found ', 404, 'USER_IS_NOT_FOUND')
  const { size, productId, colorCode, price, quantity, variantId } = cartData
  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{
        productId,
        colorCode,
        size,
        price,
        variantId,
        quantity: Number(quantity),
        totalPrice: price * quantity
      }]
    })
  } else {
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.toString() === productId &&
      item.colorCode === colorCode &&
      item.size === size
    )
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity
      cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * price
    } else {
      cart.items.push({
        productId,
        colorCode,
        size,
        price,
        quantity,
        variantId,
        totalPrice: price * quantity
      });
    }
  }
  cart.subTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
  const currentShipping = cart.shippingFee || 0;
  const currentDiscount = cart.discount || 0;
  cart.grandTotal = (cart.subTotal + currentShipping) - currentDiscount;
  const updatedCart = await cart.save();
  return updatedCart;
}

export const getCartItems = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.productId',
      select: 'productName variants salePrice'
    }).lean()
  cart.items.forEach(item => {
    const product = item.productId;

    if (!product) {
      item.image = 'default-placeholder.png';
      return;
    }

    const matchedVariant = product.variants.find(variant =>
      variant.colorCode.toString() === item.colorCode.toString()
    );

    if (matchedVariant && matchedVariant.variantImages && matchedVariant.variantImages.length > 0) {
      item.image = matchedVariant.variantImages[0];
    } else {
      item.image = 'default-product-image.png';
    }
    delete item.productId.variants;
  });
  return cart
}