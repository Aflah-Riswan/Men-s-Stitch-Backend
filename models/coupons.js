import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: { type: String, required: true },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'flat']
  },
  discountValue: { type: Number, required: true },
  minPurchaseAmount: { type: Number, required: true, default: 0 },
  maxDiscountAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: null },
  isUnlimited: { type: Boolean, required: true, default: false },
  expiryDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (this.isNew) {
          return value >= today;
        }
        if (this.constructor.name === 'Query') {
          return value >= today;
        }

        return value >= today;
      },
      message: 'The expiry date cannot be in the past.'
    }
  },
  isActive: { type: Boolean, required: true, default: true },
  usedCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, required: true, default: false },

}, { timestamps: true })


const Coupons = mongoose.model('Coupons', couponSchema)

export default Coupons