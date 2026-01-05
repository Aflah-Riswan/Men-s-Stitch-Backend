import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  slug: { type: String, unique: true },
  image: { type: String, required: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  categoryOffer: { type: Number, required: true, default: 0 },
  discountType: { type: String, required: true },
  maxRedeemable: { type: Number, default:null },
  isListed: { type: Boolean, required: true, default: true },
  isFeatured: { type: Boolean, required: true, default: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.categoryName && this.isModified('categoryName')) {
    this.slug = slugify(this.categoryName, {
      lower: true,
      strict: true,
      trim: true
    });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;