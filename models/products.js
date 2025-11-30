
const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
  xs: { type: Number, default: 0 },
  sm: { type: Number, default: 0 },
  md: { type: Number, default: 0 },
  lg: { type: Number, default: 0 },
  xl: { type: Number, default: 0 },
  xxl: { type: Number, default: 0 }
}, { _id: false })

const variantsSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorCode: { type: String, required: true },
  images: [{ type: String }],
  stock: stockSchema
})

const attributesSchema = new mongoose.Schema({
  material: { type: String, required: true },
  fit: { type: String, required: true },
  sleeveType: { type: String, required: true },
  collarType: { type: String, required: true }
}, { _id: false });

const ratingSchema = new mongoose.Schema({
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  productDetails: { type: String, required: true },
  coverImage: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  variants: [variantsSchema],
  attributes: attributesSchema,
  faqs: [{ question: { type: String, required: true }, answer: { type: String, required: true } }],
  tags: [{ type: String, required: true }],
  rating: {
    type: ratingSchema,
    default: () => ({ average: 0, count: 0 })
  },
  isListed: {type:Boolean,default:true},
  isDeleted: {type:Boolean,default:false},
  deletedAt : {type:Date,default:null}
},
  { timestamps: true }
)
const Products = mongoose.model('Products',productSchema)
module.exports=Products