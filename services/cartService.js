import Cart from "../models/cart.js"
import User from "../models/users.js"
import AppError from "../utils/appError.js"

export const addToCart = async (userId, cartData) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User is not found ', 404, 'USER_IS_NOT_FOUND')
  const { size, productId, color, price, quantity } = cartData
  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{
        productId,
        color,
        size,
        price,
        quantity: Number(quantity),
        totalPrice: price * quantity
      }]
    })
  } else {
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.toString() === productId &&
      item.color === color &&
      item.size === size
    )
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity
      cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * price
    } else {
      cart.items.push({
        productId,
        color,
        size,
        price,
        quantity,
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