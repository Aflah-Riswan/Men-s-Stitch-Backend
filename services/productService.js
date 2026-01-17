import Products from '../models/products.js';
import Category from '../models/category.js';
import AppError from '../utils/appError.js';
import { calculateBestPrice } from '../utils/calculateBestPrice.js';

export const createProductService = async (data) => {
  if (!data || Object.keys(data).length === 0) {
    throw new AppError('Product data is empty', 400, 'EMPTY_DATA');
  }
  const { originalPrice, salePrice, productOffer, mainCategory } = data
  const priceDetails = await calculateBestPrice(originalPrice, salePrice, productOffer, mainCategory)
  const finalData = {
    ...data,
    salePrice: priceDetails.salePrice,
    activeOfferSource: priceDetails.activeOfferSource
  }
  const product = new Products(finalData);
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
  const filterQuery = { isDeleted: false ,};

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
  const { originalPrice, salePrice, productOffer, mainCategory } = data
  
  const priceDetails = await calculateBestPrice(originalPrice, salePrice, productOffer, mainCategory)
  const finalData = {
    ...data,
    salePrice: priceDetails.salePrice,
    activeOfferSource: priceDetails.activeOfferSource
  }
  const updatedProduct = await Products.findByIdAndUpdate(
    { _id: id },
    { $set: finalData },
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

// Helper to safely escape special regex characters (prevents crashes)
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export const getProductsByCategoryService = async (slug, queryParams) => {
  const {
    minPrice,
    maxPrice,
    sizes,
    page = 1,
    limit = 10,
    search,
    sort,
    ...dynamicFilters
  } = queryParams;

  // 1. Initialize Filter
  let filter = {
    isDeleted: false,
    isListed: true,
  };

  // 2. Handle Category Slug
  const regexValue = new RegExp(`^${slug}$`, 'i')
  if (slug.toLowerCase() !== 'all') {
    const categoryDoc = await Category.findOne({
      categoryName: { $regex: regexValue }
    });

    if (!categoryDoc) {
      throw new AppError(`Category '${slug}' not found`, 404, 'CATEGORY_NOT_FOUND');
    }

    filter.mainCategory = categoryDoc._id;
  }

  // 3. Price Filter
  if (minPrice || maxPrice) {
    filter.salePrice = {};
    if (minPrice) filter.salePrice.$gte = Number(minPrice);
    if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
  }

  // 4. Size Filter (Uses $or)
  // Note: We use $and later to safely combine this with Search if needed
  let sizeFilter = null;
  if (sizes) {
    const sizeArray = sizes.split(',');
    sizeFilter = {
      $or: sizeArray.map(size => ({
        [`variants.stock.${size.toUpperCase()}`]: { $gt: 0 }
      }))
    };
  }

  // ---------------------------------------------------------
  // 🔍 5. SMART FUZZY SEARCH LOGIC
  // ---------------------------------------------------------
  let searchFilter = null;
  
  if (search) {
    const cleanSearch = search.trim();
    
    // A. Singularize: Remove trailing 's' (e.g., "shirts" -> "shirt")
    // Exception: Don't remove if word ends in 'ss' (like "dress")
    let baseTerm = cleanSearch;
    if (baseTerm.length > 3 && baseTerm.toLowerCase().endsWith('s') && !baseTerm.toLowerCase().endsWith('ss')) {
      baseTerm = baseTerm.slice(0, -1);
    }

    // B. Create Fuzzy Pattern
    // Split "tshirt" -> ['t','s','h','i','r','t']
    // Join with [\s-]* -> Matches "t-shirt", "t shirt", "tshirt"
    const fuzzyPattern = baseTerm
      .split('')
      .map(char => escapeRegex(char))
      .join('[\\s-]*');

    // C. Final Regex: Add "s?" at the end to match singular OR plural in DB
    const finalRegex = new RegExp(fuzzyPattern + "s?", 'i');
    
    // D. Apply to productName
    searchFilter = { productName: { $regex: finalRegex } };
    
    // OPTIONAL: If you want to search Description too, use this instead:
    /*
    searchFilter = {
      $or: [
        { productName: { $regex: finalRegex } },
        { description: { $regex: finalRegex } }
      ]
    };
    */
  }

  // ---------------------------------------------------------
  // 6. Combine Filters Safely
  // ---------------------------------------------------------
  
  // Since both 'sizes' and 'search' might want to use $or, 
  // we push them into a top-level $and array if both exist.
  if (sizeFilter || searchFilter) {
    const andConditions = [];
    if (sizeFilter) andConditions.push(sizeFilter);
    if (searchFilter) andConditions.push(searchFilter);
    
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }
  }

  // 7. Dynamic Attributes Filter
  Object.keys(dynamicFilters).forEach(key => {
    if (key.startsWith('attr_')) {
      const actualAttributeName = key.replace('attr_', '');
      const rawValues = dynamicFilters[key].split(',');
      const regexValues = rawValues
        .map(v => v.trim())
        .filter(Boolean)
        .map(v => {
          const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp(`^${escaped}$`, 'i');
        });

      if (regexValues.length > 0) {
        filter[`attributes.${actualAttributeName}`] = { $in: regexValues };
      }
    }
  });

  // 8. Sorting
  let sortOptions = { createdAt: -1 }; 
  if (sort) {
    switch (sort) {
      case 'price_low_high': sortOptions = { salePrice: 1 }; break;
      case 'price_high_low': sortOptions = { salePrice: -1 }; break;
      case 'newest': sortOptions = { createdAt: -1 }; break;
      case 'oldest': sortOptions = { createdAt: 1 }; break;
      case 'a_z': sortOptions = { productName: 1 }; break;
      case 'z_a': sortOptions = { productName: -1 }; break;
      default: sortOptions = { createdAt: -1 };
    }
  }

  // 9. Pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  console.log("Final MongoDB Filter:", JSON.stringify(filter, null, 2));

  // 10. Execute Query
  const products = await Products.find(filter)
    .sort(sortOptions) 
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