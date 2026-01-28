import joi from 'joi';

export const validateCategory = (req, res, next) => {

  const schema = joi.object({
    categoryName: joi.string().min(3).required().messages({ 
        'string.empty': 'Category name is required', 
        'string.min': 'Category name must be greater than 3 characters' 
    }),

    discountType: joi.string().valid('Flat', 'Percentage').required(),

   
    categoryOffer: joi.number().min(0).required()
      .when('discountType', {
        is: 'Percentage',
        then: joi.number().max(100).messages({ 'number.max': 'Percentage discount cannot exceed 100%' }),
        otherwise: joi.number()  
      })
      .messages({
        'number.base': 'Offer must be a number',
        'number.min': 'Offer cannot be negative'
      }),

   
    maxRedeemable: joi.number()
      .when('discountType', {
        is: 'Flat',
        then: joi.allow(null).optional(),
        otherwise: joi.number().min(1).required().messages({ 
            'any.required': 'Max redeemable limit is required for Percentage offers' 
        })
      }),

    image: joi.string().required().messages({
      'string.empty': 'Image URL is required'
    }),

    parentCategory: joi.alternatives().try(
      joi.string().hex().length(24), 
      joi.string().valid('none', 'None', ''), 
      joi.allow(null)
    ).optional(),

    isListed: joi.boolean(),
    isFeatured: joi.boolean()
  }).unknown(true);

  const { error } = schema.validate(req.body);
  if (error) {
    console.log("joi Validation Failed:", error.details[0].message);
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

export default validateCategory;