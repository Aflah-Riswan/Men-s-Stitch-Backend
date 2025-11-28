
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
    agreeTerms : Joi.boolean().valid(true).required()
  })
  return validateLoginSchema.validate(credentials)

}
module.exports={validateUserLogin}