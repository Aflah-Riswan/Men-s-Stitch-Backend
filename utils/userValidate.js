
const Joi = require('joi')



function validateUserLogin(credentials) {

  const validateLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(12).required().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*])[A-Za-z\d!@#$%&*]{8,12}$/),
    messages: (
      {
        'string.pattern.base': 'Pasword must contain one lowercase letter,uppercase letter ,one digit and one special character ',
        'string.min': 'password should contain minimum 8 characters',
        'string.max': 'The maximum characters are 12 ',
        'any.required': 'Password is required'
      }

    ),
    agreeTerms: Joi.boolean().valid(true).required()
  })
  return validateLoginSchema.validate(credentials)

}
const validateUserSignup = (credentials) => {

  const validateSignUpSchema = Joi.object({
    firstName: Joi.string().min(3).max(30).trim().required().messages(
      {
        'string.empty': 'Enter your frist name',
        'string.min': 'frist name should be minimum value of 3'
      }
    ),
    lastName: Joi.string().min(3).max(30).required().messages({
      'string.empty': 'last name is required',
      'string.min': 'last nam eshould be minimum value of 3'
    }),

    phone: Joi.string().length(10).pattern(/^[6-9]\d{9}$/).messages({
      'string.length': 'Phone number should with exactly 10 didgits',
      'string.pattern.base': 'Invalid phone number'
    }),
     email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required().messages({
      'string.pattern.base': 'Invalid password pattern',
      'string.min': 'password should contain atleast 8 characters'
    }),

    confirmPassword: Joi.string().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords do not match'
    }),

    agreeTerms: Joi.boolean().valid(true).required()
  })

   return validateSignUpSchema.validate(credentials)
}


module.exports = { validateUserLogin, validateUserSignup }