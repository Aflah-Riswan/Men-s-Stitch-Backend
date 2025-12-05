
const productService = require('../services/productService')

const createProduct = async (req, res) => {
  try {
    const data = req.body
    const response = await productService.createProductService(data)
    if (response.success) return res.status(201).json(response.data)
    else return res.status(401).json(response)
  } catch (error) {
    console.log("error found  : ", error)
    return res.satus(400).json(error.message)
  }
}
module.exports = { createProduct }