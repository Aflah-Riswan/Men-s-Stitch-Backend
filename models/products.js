import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  XS: { type: Number, default: 0 },
  S: { type: Number, default: 0 },
  M: { type: Number, default: 0 },
  L: { type: Number, default: 0 },
  XL: { type: Number, default: 0 },
  XXL: { type: Number, default: 0 }
}, { _id: false });

const variantsSchema = new mongoose.Schema({
  productColor: { type: String, required: true },
  colorCode: { type: String, required: true },
  variantImages: { type: [String] },
  stock: stockSchema
});

const ratingSchema = new mongoose.Schema({
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImages: { type: [String], required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  variants: [variantsSchema],
  attributes: {
    type: Object,
    of: String
  },
  faqs: { type: [{ question: String, answer: String }], default: [] },
  tags: { type: [String], required: true, default: [] },
  rating: {
    type: ratingSchema,
    default: () => ({ average: 0, count: 0 })
  },
  isListed: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
},
  { timestamps: true }
);

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

productSchema.index({
  productName : 'text',
  productDescription : 'text',
  "attributes.$**": "text",
  tags:'text'
},{
 weights : { productName : 10 , productDescription : 5 , "attributes.$**": 3,  tags : 2}
} )

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

const Products = mongoose.model('Products', productSchema);
export default Products;