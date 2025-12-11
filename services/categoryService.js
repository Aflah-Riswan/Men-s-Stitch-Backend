
const Category = require('../models/category')
const addCategory = async (data) => {
  try {
    if (data.parentCategory === 'false' || data.parentCategory === false || data.parentCategory === 'none') {
      data.parentCategory = null;
    }
    console.log("sanitaized data : ", data)
    const categoryExist = await Category.findOne({ categoryName: data.categoryName, isDeleted: false })
    if (categoryExist) return { success: false, message: 'already exist' }
    const category = new Category(data)
    const savedCategory = await category.save()
    return {
      success: true,
      message: 'category added successsfully',
      category: savedCategory
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}

const getCategoryService = async (data) => {
  try {
    const {
      page = Number(data.page) || 1,
      limit = Number(data.limit) || 5,
      search,
      category,
      status,
      sort,
      discount
    } = data

    const skip = (page - 1) * limit
    const filter = { isDeleted: false }
    filter.$or = [{ categoryName: { $regex: search, $options: 'i' } }]
    if (category) {
      filter.categoryName = category
    }
    if (status) {
      if(status === 'active') filter.isListed = true
      else filter.isListed = false
    }
    if (discount) {
      filter.discountType = discount
    }
    let sortQuery = { createdAt: -1 }
    if (sort === 'newest') sortQuery = { createdAt: 1 }
    if (sort === 'oldest') sortQuery = { createdAt: -1 }
    if (sort === 'a-z') sortQuery = { categoryName: 1 }
    if (sort === 'z-a') sortQuery = { categoryName: -1 }

    const categories = await Category.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    
    console.log("categoriess: ",categories)

    const totalCategories = await Category.countDocuments(filter);
    return {
      success: true,
      message: ' fetch data succefully',
      categories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page
    }
  } catch (error) {
    return  { success:false , message: error.message}
  }
}

const toggleIsList = async (categoryId) => {
  const categoryItem = await Category.findById(categoryId)
  if (categoryItem) {
    categoryItem.isListed = !categoryItem.isListed
    await categoryItem.save()
    return categoryItem
  }
  else {
    console.log("cant find the category item ")
  }

}
const updateCategory = async (slug, data) => {
  try {
    const isExisted = await Category.findOne({ categoryName: data.categoryName })
    if (isExisted) {
      if (isExisted.slug !== slug) {
        return {
          success: false,
          message: `The category name "${data.categoryName}" is already taken by another category.`
        }
      }
    }
    const updatedItem = await Category.findOneAndUpdate({ slug }, { $set: data }, { new: true })
    console.log(updatedItem)
    return { success: true, updatedItem }
  } catch (error) {
    console.log("error in updating data : ", error)
    return { success: false, message: error }
  }

}
const deleteCategory = async (id) => {
  try {
    const itemToDelete = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
    if (!itemToDelete) {
      return { success: false, message: "Category not found" };
    }
    return { success: true, itemToDelete }
  } catch (error) {
    console.log(error)
    return { success: false, message: error }
  }

}

module.exports = { addCategory, toggleIsList, updateCategory, deleteCategory,getCategoryService }