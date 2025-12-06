

const joi = require('joi')

const validateProduct = (req, res, next) => {
  const schema = joi.object({
    productName: joi.string().min(3).required().messages({ 'string.empty': 'product name cant be empty ', 'string.min': 'product name should be minimum value of 3 letters' }),

    productDescription: joi.string().min(20).required().messages({ 'string.empty': 'product description cant be empty', 'string.min': 'enter atleast 20 words in product description' }),

    coverImages: joi.array().items(joi.string().uri()).length(3).required().messages({ 'array.base': 'cover images must be a list of images', 'array.length': 'only 3 cover images are required', 'string.uri': 'invalid url is found', 'any.required': 'cover images are required' }),

    originalPrice: joi.number().min(1).required().messages({ 'number.base': 'original price must be a number', 'number.min': 'original price should b egreater than 0', 'any.required': 'original price is reauired', }),

    salePrice: joi.number().min(1).required().less(joi.ref('originalPrice')).messages({ 'number.base': 'sale price should be a number', 'number.min': 'sales should be greater than 0', 'any.required': 'sale price is required','number.less': 'Sale Price must be less than Original Price' }),

    mainCategory: joi.string().hex().length(24).required().messages({ 'any.required': 'main category is required', 'string.base': 'invalid category selection', 'string.hex': 'invalid category selection ', 'string.length': 'invalid category selction' }),

    subCategory: joi.string().hex().length(24).optional().allow(null, '').required().messages({ 'string.base': 'invalid subcategory ', 'string.hex': 'invalid sub category' }),

    variants: joi.array().items(joi.object({
      productColor: joi.string().required().messages({ 'any.required': 'product color is required' }),

      colorCode: joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required().messages({ 'any.required': 'color coded is required', 'string.base.pattern': 'invalid color pattern' }),

      variantImages: joi.array().items(joi.string().uri()).length(3).required().messages({ 'any.required': 'variant images is required', 'array.length': 'Each variant must have exactly 3 images.', 'string.uri': 'Variant images must be valid URLs.' }),

      stock: joi.object({
        XS: joi.number().min(0).default(0),
        S: joi.number().min(0).default(0),
        M: joi.number().min(0).default(0),
        L: joi.number().min(0).default(0),
        XL: joi.number().min(0).default(0),
        XXL: joi.number().min(0).default(0)
      }).required().messages({ 'object.base': 'Stock must be an object with size keys (XS, S, M...).', 'any.required': 'Stock information is required.' })
    })

    ).min(1).required().messages({ 'array.min': 'You must add at least one product variant.', 'any.required': 'Variants are required.' }),

    attributes: joi.object().pattern(joi.string().required(), joi.string().required()).required().messages({
      'object.base': 'Attributes must be a valid object.', 'object.pattern.match': 'Invalid attribute format. Both label and value must be strings.', 'any.required': 'Attributes are required.'
    }),

    faqs: joi.array()
      .items(joi.object({

        question: joi.string().min(3).required().messages({ 'string.empty': 'FAQ question cannot be empty.', 'any.required': 'FAQ question is required.' }),

        answer: joi.string().min(3).required().messages({ 'string.empty': 'FAQ answer cannot be empty.', 'any.required': 'FAQ answer is required.' })
      })
      ).optional().messages({ 'array.base': 'FAQs must be a list of questions and answers.' }),

    tags: joi.array().items(joi.string().trim().min(2).max(30)).optional().messages({ 'array.base': 'Tags must be a list of strings.', 'string.min': 'Tags must be at least 2 characters long.', 'string.max': 'Tags cannot exceed 30 characters.' }),

    rating: joi.object({
      average: joi.number().min(0).max(5).default(0), count: joi.number().integer().min(0).default(0)
    }).optional().messages({
      'number.min': 'Rating values cannot be negative.', 'number.max': 'Average rating cannot exceed 5.', 'number.integer': 'Rating count must be a whole number.'
    }),
    isListed: joi.boolean().default(true),

  })

  const {error} = schema.validate(req.body)
  console.log(error)
  if(error){
    console.log(" error found in joi validation in products : ",error.details[0].message)
    return res.status(400).json({
      success:false,
      message:error.details[0].message
    })
  }

  next()
}

module.exports = { validateProduct }


