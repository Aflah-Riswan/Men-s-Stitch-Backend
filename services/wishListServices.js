import WishList from '../models/wishlist.js';

export const addToWishList = async (productId, userId) => {
  try {
    let wishlist = await WishList.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new WishList({
        user: userId,
        products: [{ productId }]
      });
      await wishlist.save();
      return { success: true, message: 'Item added successfully' }; 
    } else {
      const itemExists = wishlist.products.some((item) => item.productId.toString() === productId);
      
      if (itemExists) {
        return { success: false, message: 'Item already in wishlist' };
      }
      
      wishlist.products.push({ productId });
      await wishlist.save();
      return { success: true, message: 'Item added successfully' };
    }
  } catch (error) {
    console.error("Error in addToWishList:", error);
    throw error;
  }
};

export const removeFromWishlist = async (userId, itemId) => {
  const wishlist = await WishList.findOneAndUpdate(
    { user: userId },
    { $pull: { products: { _id: itemId } } },
    { new: true }
  ).populate('products.productId');

  if (!wishlist) {
    return { success: false, message: 'Wishlist Not Found' };
  }
  
  const activeProducts = wishlist.products.filter(item => item.productId);
  
  return { success: true, message: 'Item removed', products: activeProducts };
};

export const getWishlist = async (userId) => {
  const wishlist = await WishList.findOne({ user: userId })
    .populate('products.productId', 'productName salePrice originalPrice coverImages description');
    
  if (!wishlist) return { success: true, products: [] };
  
  const activeProducts = wishlist.products.filter(item => item.productId);
  return { success: true, products: activeProducts };
};