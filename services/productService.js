
const Products = require('../models/products')

const createProductService = async (data) => {
  try {
    if (!data) return { success: false, message: 'data is empty' }
    const response = new Products(data)
    const savedProduct = await response.save()
    console.log("saved product : ", savedProduct)
    if (savedProduct) return { success: true, message: 'Product added suuccesfully', data: savedProduct }
    else return { success: false, message: 'Something found error' }
  } catch (error) {
    return { success: false, message: 'Error found in Server side' }
  }
}

const getProductsService = async (data) => {
  try {
    const {
      page = Number(data.page) || 1,
      limit = Number(data.limit) || 5,
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      status
    } = data


    const skip = (page - 1) * limit
    const filterQuery = { isDeleted: false }

    if (search) {
      filterQuery.$or = [{ productName: { $regex: search, $options: 'i' } },
      { productDescription: { $regex: search, $options: 'i' } }
      ]
    }
    if (category) {
      filterQuery.mainCategory = category
    }
    if (minPrice || maxPrice) {
      filterQuery.salePrice = {}
      if (minPrice) filterQuery.salePrice.$gte = Number(minPrice)
      if (maxPrice) filterQuery.salePrice.$lte = Number(maxPrice)
    }
    if (status === 'active') filterQuery.isListed = true
    if (status === 'inactive') filterQuery.isListed = false

    let sortQuery = { createdAt: -1 }
    if (sort === 'price-low') sortQuery = { salePrice: 1 }
    if (sort === 'newest') sortQuery = { createdAt: 1 }
    if (sort === 'oldest') sortQuery = { createdAt: -1 }
    if (sort === 'price-high') sortQuery = { salePrice: -1 }
    if (sort === 'a-z') sortQuery = { productName: 1 }
    if (sort === 'z-a') sortQuery = { productName: -1 }

    console.log("filter : ", filterQuery)

    const products = await Products.find(filterQuery).populate('mainCategory', 'categoryName').sort(sortQuery).skip(skip).limit(limit)

    const totalProducts = await Products.countDocuments(products)

    return {
      success: true,
      message: ' fetch data succefully',
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page
    }

  } catch (error) {
    console.log(error)
  }
}

const productToggleIsList = async (id) => {
 
  try {
    const response = await Products.findByIdAndUpdate(id, [ { $set : { isListed : { $not : '$isListed' } } } ],{new:true})
    console.log("finished")
    if(!response) return { success:false , message:'Product is not existed'}
    
    return { success:true , updatedData : response}

  } catch {
    return {success:false , message:error.message}
  }

}

module.exports = { createProductService, getProductsService,productToggleIsList }