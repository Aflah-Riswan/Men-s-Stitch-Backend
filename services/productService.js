
const Products = require('../models/products')

const createProductService = async (data) => {
  try {
    if (!data) return { success: false, message: 'data is empty' }
    const response = new Products(data)
    const savedProduct = await response.save()
    console.log("saved product : ",savedProduct)
    if (savedProduct) return { success: true, message: 'Product added suuccesfully' ,data:savedProduct }
    else return { success: false, message: 'Something found error' }
  } catch (error) {
    return { success: false, message: 'Error found in Server side' }
  }
}

module.exports = {createProductService}