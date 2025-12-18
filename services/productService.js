import Products from '../models/products.js';
import Category from '../models/category.js';
import AppError from '../utils/appError.js';

export const createProductService = async (data) => {
  if (!data || Object.keys(data).length === 0) {
    throw new AppError('Product data is empty', 400, 'EMPTY_DATA');
  }

  const product = new Products(data);
  const savedProduct = await product.save();

  return {
    success: true,
    message: 'Product added successfully',
    data: savedProduct
  };
};

export const getProductsService = async (data) => {
  const {
    page = Number(data.page) || 1,
    limit = Number(data.limit) || 5,
    category,
    search,
    minPrice,
    maxPrice,
    sort,
    status
  } = data;

  const skip = (page - 1) * limit;
  const filterQuery = { isDeleted: false };

  if (search) {
    filterQuery.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { productDescription: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) {
    filterQuery.mainCategory = category;
  }
  if (minPrice || maxPrice) {
    filterQuery.salePrice = {};
    if (minPrice) filterQuery.salePrice.$gte = Number(minPrice);
    if (maxPrice) filterQuery.salePrice.$lte = Number(maxPrice);
  }
  
  if (status === 'active') filterQuery.isListed = true;
  if (status === 'inactive') filterQuery.isListed = false;

  let sortQuery = { createdAt: -1 };
  if (sort === 'price-low') sortQuery = { salePrice: 1 };
  if (sort === 'newest') sortQuery = { createdAt: -1 };
  if (sort === 'oldest') sortQuery = { createdAt: 1 };
  if (sort === 'price-high') sortQuery = { salePrice: -1 };
  if (sort === 'a-z') sortQuery = { productName: 1 };
  if (sort === 'z-a') sortQuery = { productName: -1 };

  const products = await Products.find(filterQuery)
    .populate('mainCategory', 'categoryName')
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  const totalProducts = await Products.countDocuments(filterQuery);

  return {
    success: true,
    message: 'Data fetched successfully',
    products,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
    totalProducts
  };
};

export const productToggleIsList = async (id) => {
  const response = await Products.findByIdAndUpdate(
    id, 
    [{ $set: { isListed: { $not: '$isListed' } } }], 
    { new: true }
  );

  if (!response) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  return { success: true, updatedData: response };
};

export const updateProductService = async (id, data) => {
  const updatedProduct = await Products.findByIdAndUpdate(
    { _id: id }, 
    { $set: data }, 
    { new: true }
  );

  if (!updatedProduct) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  return { success: true, updatedProduct };
};

export const deleteProductService = async (id) => {
  const response = await Products.findByIdAndUpdate(
    { _id: id }, 
    { isDeleted: true }, 
    { new: true }
  );

  if (!response) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  return { success: true, deletedData: response };
};

export const getProductHomeService = async () => {
  const products = await Products.find({ isDeleted: false, isListed: true });
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const newArrivals = await Products.find({ 
    isDeleted: false, 
    isListed: true, 
    createdAt: { $gte: sevenDaysAgo } 
  }).sort({ createdAt: -1 }).limit(4);

  const featured = await Products.find({ isListed: true, isDeleted: false }).limit(4);

  return {
    success: true,
    products,
    newArrivals,
    featured
  };
};

export const getProductByIdHomeService = async (id) => {
  const product = await Products.findById({ _id: id }).populate({
    path: 'reviews',
    populate: {
      path: 'user',
      select: 'firstName email'
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const relatedProducts = await Products.find({
    mainCategory: product.mainCategory, 
    _id: { $ne: id },
    isDeleted: false,
    isListed: true
  }).select('productName salePrice originalPrice coverImages rating').limit(4);

  return { success: true, product, relatedProducts };
};

export const getProductsByCategoryService = async (slug, queryParams) => {
  const {
    minPrice,
    maxPrice,
    sizes,
    page = 1,
    limit = 10,
    search,
    ...dynamicFilters
  } = queryParams;

  let filter = {
    isDeleted: false,
    isListed: true,
  };

  if (slug.toLowerCase() !== 'all') {
    const categoryDoc = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${slug}$`, 'i') }
    });

    if (!categoryDoc) {
      throw new AppError(`Category '${slug}' not found`, 404, 'CATEGORY_NOT_FOUND');
    }

    filter.mainCategory = categoryDoc._id;
  }

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
    filter.$text = { $search: search };
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

  return {
    success: true,
    products,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalProducts: totalCount
    }
  };
};