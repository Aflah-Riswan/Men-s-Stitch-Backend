
const Products = require('../models/products')
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

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      sort = '',
      status = ''
    } = req.query
    console.log("one")
    const response = await productService.getProductsService(
      {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        category,
        minPrice,
        maxPrice,
        sort,
        status
      }
    )
    console.log("two")
    if (response.success) {
      console.log("inside condition")
      return res.status(201).json({
        success: response.success,
        products: response.products,
        pagination: {
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          hasNextPage: response.currentPage < response.totalProduct,
          hasPrevPage: response.currentPage > 1
        }

      })
    } else {
      return res.json({ success: false, message: response.message })

    }

  } catch (error) {
    console.log("errror : ", error)
    return res.json({ success: false, message: error.message })
  }
}

const productToggleIsList = async (req, res) => {
  try {

    const { id } = req.params
    const response = await productService.productToggleIsList(id)
    if (response.success) return res.json({ success: true, updatedData: response.updatedData })
    else return res.json({ success: false, message: response.message })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }

}
const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Products.findById(id)
    if (!product) return res.json({ success: false, message: 'product is not found' })
    return res.json({ success: true, product })

  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}
const updateProduct = async (req, res) => {
  const { id } = req.params
  const data = req.body
  try {
    const response = await productService.updateProductService(id,data)
    console.log("response : ", response)
    if (response.success) {
      return res.status(201).json({success:true, updatedProduct :response.updatedProduct})
    } else {
      return res.json({ success: false, message: response.message})
    }
  } catch (error) {
     return res.json({ success: false, message: error})
  }
}
const deleteProduct = async (req,res) =>{
  try {
    const {id} = req.params
    const response = await productService.deleteProductService(id)
    if(response.success) return res.json({success: true , deltedData : response.deletedData})
    else return res.json({success:false,message:response.message})
  } catch (error) {
    return res.json({success:false,message:error.message})
  }
}


module.exports = { createProduct, getProducts, productToggleIsList, getProductById,updateProduct ,deleteProduct }