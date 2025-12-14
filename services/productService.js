
const Products = require('../models/products')
const Category = require('../models/category')
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
    const response = await Products.findByIdAndUpdate(id, [{ $set: { isListed: { $not: '$isListed' } } }], { new: true })
    console.log("finished")
    if (!response) return { success: false, message: 'Product is not existed' }

    return { success: true, updatedData: response }

  } catch {
    return { success: false, message: error.message }
  }

}

const updateProductService = async (id, data) => {
  try {
    const updatedProduct = await Products.findByIdAndUpdate({ _id: id }, { $set: data }, { new: true })
    console.log(updatedProduct)
    console.log("helllloooo")
    return { success: true, updatedProduct }
  } catch (error) {

    console.log("error in updating data : ", error)
    return { success: false, message: error }
  }
}
const deleteProductService = async (id) => {

  try {
    const response = await Products.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true })

    if (!response) return { success: false, message: ' product is not found ' }
    return { success: true, deletedData: response }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

const getProductHomeService = async () => {
  try {
    const products = await Products.find({ isDeleted: false })
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newArrivals = await Products.find({ isDeleted: false, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).limit(4)
    const featured = await Products.find({ isListed: true, isDeleted: false }).limit(4)
    return {
      success: true,
      products,
      newArrivals,
      featured
    }
  } catch (error) {
    console.log(" response : ", error)
    return { success: false, message: ' something went wrong' }
  }
}
const getProductByIdHomeService = async (id) => {
  try {
    const product = await Products.findById({ _id: id }).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'firstName email'
      }
    })

    const relatedProducts = await Products.find({
      mainCategory: product.mainCategory, _id: { $ne: id }
    }).select('productName salePrice originalPrice coverImages rating').limit(4)

    return { success: true, product, relatedProducts }

  } catch (error) {
    console.log(error)
    return { success: false, message: 'something went wrong' }
  }
}


const getProductsByCategoryService = async (slug, queryParams) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      sizes,  
      page = 1, 
      limit = 10,
      search,
      ...dynamicFilters 
    } = queryParams;

    const categoryDoc = await Category.findOne({ 
      categoryName: { $regex: new RegExp(`^${slug}$`, 'i') } 
    });

    if (!categoryDoc) {
      throw new Error(`Category '${slug}' not found`);
    }

    let filter = {
      isDeleted: false,
      isListed: true,
      mainCategory: categoryDoc._id 
    };

    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    if (sizes) {
      const sizeArray = sizes.split(',');
      filter.$or = sizeArray.map(size => ({
        [`variants.stock.${size.toUpperCase()}`]: { $gt: 0 } 
      }));
    }

    if (search) {
      filter.productName = { $regex: search, $options: 'i' };
    }

    Object.keys(dynamicFilters).forEach(key => {
      if (key.startsWith('attr_')) {
        const actualAttributeName = key.replace('attr_', '');
        const values = dynamicFilters[key].split(','); 
        const regexValues = values.map(v => new RegExp(`^${v}$`, 'i'));  
        filter[`attributes.${actualAttributeName}`] = { $in: regexValues };
      }
    });

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Products.find(filter)
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Products.countDocuments(filter);
    console.log(" products : ",products)
    return {
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalProducts: totalCount
      }
    };

  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = { createProductService, getProductsService, productToggleIsList, updateProductService, deleteProductService, getProductHomeService, getProductByIdHomeService , getProductsByCategoryService} 