
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId,ref: 'Products',required: true },
      variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
      colorCode: { type: String, required: true },
      size: { type: String, required: true },
      quantity : {type: Number , required: true},
      addedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const WishList = mongoose.model('WishList', wishlistSchema);
export default WishList