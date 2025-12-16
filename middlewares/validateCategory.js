import joi from 'joi';

export const validateCategory = (req, res, next) => {

  const schema = joi.object({
    categoryName: joi.string().min(3).required().messages({ 'string.empty': 'Category name is required', 'string.min': 'Category name must be greater than 3 characters' }),
    categoryOffer: joi.number().min(1).max(100).required().messages({
      'number.max': 'Offer percentage should be less than 100',
      'number.base': 'percentage should be a number'
    }),
    maxRedeemable: joi.number().min(1).required().messages({
      'number.min': 'maxRedeemable cannt be a negative',
    }),
    image: joi.string().uri().required().messages({
      'string.empty': 'Image URL is required',
      'string.uri': 'Image must be a valid URL link (http/https)'
    }),
    discountType: joi.string().valid('Flat', 'Percentage').required(),

    parentCategory: joi.alternatives().try(
      joi.string().hex().length(24),
      joi.string().valid('none', ''),
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