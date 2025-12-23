import { z } from 'zod';

export const validateCoupon = (req, res, next) => {
  try {
    const couponSchema = z.object({
      couponCode: z.string()
        .min(3, 'Minimum length is 3')
        .trim()
        .transform((val) => val.toUpperCase()),

      description: z.string().min(10, 'Min length is 10 characters'),

      discountType: z.enum(['flat', 'percentage']),

      discountValue: z.coerce.number().positive('Discount value must be positive').default(1),

      minPurchaseAmount: z.coerce.number().nonnegative("Min purchase cannot be negative").default(1),

      maxDiscountAmount: z.coerce.number().nonnegative().default(1),

      expiryDate: z.coerce.date().refine((date) => date > new Date(), { message: "Expiry date must be in the future" }),

      usageLimit: z.coerce.number().optional(),

      isUnlimited: z.boolean().default(false)
    })
    
    .refine((data) => {
      if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
      }
      return true;
    }, {
      message: 'Percentage discount cannot exceed 100%',
      path: ['discountValue']
    });
    

    const result = couponSchema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      console.log(result);
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: formattedErrors
      });
    }
    
    req.body = result.data;
    next();

  } catch (error) {
    next(error);
  }
}