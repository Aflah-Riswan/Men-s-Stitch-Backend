
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  // slug:{type:String,required:true},
  image: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  categoryOffer: { type: Number, required: true,default:0 },
  discountType: { type: String, required: true },
  maxRedeemable: { type: Number, required: true },
  isListed: { type: Boolean, required: true, default: true },
  isFeatured: { type: Boolean, required: true, default: true }
}
  , { timestamps: true }
)
const Category = mongoose.model('Category', categorySchema)
module.exports = Category