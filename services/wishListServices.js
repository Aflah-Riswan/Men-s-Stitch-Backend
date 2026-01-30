import Product from "../models/products.js";
import User from '../models/users.js';
import WishList from '../models/wishlist.js';
import AppError from '../utils/appError.js';

export const addToWishList = async (wishListData, userId) => {
  try {
    const user = await User.findOne({ _id: userId })
    if (user.isBlocked) {
      throw new AppError('You are blocked ', 403, 'USER-IS_BLOCKED')
    }
    let wishList = await WishList.findOne({ user: userId });
    if(!wishList){
      wishList =  new WishList({user: userId ,products:[]})
    }
    let { quantity  , colorCode ,productId , variantId , size } = wishListData
    const product = await Product.findById(productId)
    if(!product) return { success : false , message : 'product is not existed '}
    const isVariantExist = product.variants.id(variantId)
    if(!isVariantExist) return { success : false , message : ' variant is not existed'}
    const availableStock = isVariantExist ?.stock[size]
    if(availableStock === undefined) return { success : false , message : 'selected stock is out of stock'} 
    if(availableStock < quantity) return { success : false , message : 'stock limit is exceed'}
    wishList.products.push({productId , variantId , colorCode  , quantity , size })
    await wishList.save()
      
    
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
  const user = await User.findOne({ _id: userId })
  if (user.isBlocked) {
    throw new AppError('You are blocked ', 403, 'USER-IS_BLOCKED')
  }
  const wishlist = await WishList.findOne({ user: userId })
    .populate('products.productId', 'productName salePrice originalPrice coverImages description');

  if (!wishlist) return { success: true, products: [] };

  const activeProducts = wishlist.products.filter(item => item.productId);
  return { success: true, products: activeProducts };
};