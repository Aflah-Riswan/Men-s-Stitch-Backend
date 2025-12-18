import Category from '../models/category.js';
import AppError from '../utils/appError.js';

export const addCategory = async (data) => {
  if (data.parentCategory === 'false' || data.parentCategory === false || data.parentCategory === 'none') {
    data.parentCategory = null;
  }
  const regexValue = new RegExp(`^${data.categoryName}$`, 'i');
  const categoryExist = await Category.findOne({ 
    categoryName: { $regex: regexValue}, 
    isDeleted: false });
    
  if (categoryExist) throw new AppError('Category already exists', 409, 'CATEGORY_ALREADY_EXISTS');
  const category = new Category(data);
  const savedCategory = await category.save();
  return {
    success: true,
    message: 'category added successsfully',
    category: savedCategory
  };

};

export const getCategoryService = async (data) => {

  const {
    page = Number(data.page) || 1,
    limit = Number(data.limit) || 5,
    search = '',
    category,
    status,
    sort,
    discount
  } = data;

  const skip = (page - 1) * limit;
  const filter = { isDeleted: false };
  filter.$or = [{ categoryName: { $regex: search, $options: 'i' } }];
  if (category) {
    filter.categoryName = category;
  }
  if (status) {
    if (status === 'active') filter.isListed = true;
    else filter.isListed = false;
  }
  if (discount) {
    filter.discountType = discount;
  }
  let sortQuery = { createdAt: -1 };
  if (sort === 'newest') sortQuery = { createdAt: 1 };
  if (sort === 'oldest') sortQuery = { createdAt: -1 };
  if (sort === 'a-z') sortQuery = { categoryName: 1 };
  if (sort === 'z-a') sortQuery = { categoryName: -1 };

  const categories = await Category.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  const totalCategories = await Category.countDocuments(filter);
  return {
    success: true,
    message: ' fetch data succefully',
    categories,
    totalPages: Math.ceil(totalCategories / limit),
    currentPage: page
  };

};

export const toggleIsList = async (categoryId) => {
  const categoryItem = await Category.findById(categoryId);

  if (!categoryItem) throw new AppError("Category not found", 404, 'CATEGORY_NOT_FOUND')

  categoryItem.isListed = !categoryItem.isListed;
  await categoryItem.save();
  return categoryItem;
};

export const updateCategory = async (slug, data) => {
    const isExisted = await Category.findOne({ categoryName: data.categoryName });

    if (isExisted && isExisted.slug !== slug) {
      throw new AppError(`The category name "${data.categoryName}" is already taken.`, 409, 'CATEGORY_ALREADY_EXISTS');
    }
    const updatedItem = await Category.findOneAndUpdate({ slug }, { $set: data }, { new: true });
    if(!updatedItem) throw new AppError('Category Not Found', 404 , 'CATEGORY_NOT_FOUND')
    return { success: true, updatedItem };

};

export const deleteCategory = async (id) => {
    const itemToDelete = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!itemToDelete) throw new AppError("Category not found", 404, 'CATEGORY_NOT_FOUND');  
    return { success: true, itemToDelete };
  
};