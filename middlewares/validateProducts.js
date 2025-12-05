

const joi = require('joi')

const validateProducts = joi.object({
  productName: joi.string().min(3).required().messages({ 'string.empty': 'product name cant be empty ', 'string.min': 'product name should be minimum value of 3 letters' }),

  productCategory: joi.string().min(20).required().messages({ 'string.empty': 'product description cant be empty', 'string.min': 'enter atleast 20 words in product description' }),

  coverImages: joi.array().items(joi.string().uri()).length(3).required().messages({ 'array.base': 'cover images must be a list of images', 'array.length': 'only 3 cover images are required', 'string.uri': 'invalid url is found', 'any.required': 'cover images are required' }),

  originalPrice: joi.number().min(1).less(joi.ref('originalPrice')).required().messages({ 'number.base': 'original price must be a number', 'number.min': 'original price should b egreater than 0', 'any.required': 'original price is reauired', 'number.less': 'Sale Price must be less than Original Price' }),

  salePrice: joi.number().min(1).required().messages({ 'number.base': 'sale price should be a number', 'number.min': 'sales should be greater than 0', 'any.required': 'sale price is required' }),

  mainCategory: joi.string().hex().length(24).required().messages({ 'any.required': 'main category is required', 'string.base': 'invalid category selection', 'string.hex': 'invalid category selection ', 'string.length': 'invalid category selction' }),

  subCategory: joi.string().hex().length(24).optional().allow(null, '').required().messages({ 'string.base': 'invalid subcategory ', 'string.hex': 'invalid sub category' }),

  variants: joi.array().items(joi.object({
    productColor: joi.string().required().messages({ 'any.required': 'product color is required' }),

    colorCode: joi.string().pattern(/^(#[A-ZFa-F0-9]{6}[A-Fa-f0-9]{3})$/).required().messages({ 'any.required': 'color coded is required', 'string.base.pattern': 'invalid color pattern' }),

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

})
