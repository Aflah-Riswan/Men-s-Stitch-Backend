
const Category = require('../models/category')
const addCategory = async (data) => {

  if (data.parentCategory === 'false' || data.parentCategory === false || data.parentCategory === 'none') {
    data.parentCategory = null;
  }
  console.log("sanitaized data : ", data)
  const categoryExist = await Category.findOne({ categoryName: data.categoryName ,isDeleted:false })
  if (categoryExist) return { success: false, message: 'already exist' }
  const category = new Category(data)
  const savedCategory = await category.save()
  return {
    success: true,
    message: 'category added successsfully',
    category: savedCategory
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
const updateCategory = async (id, data) => {
  try {
    const updatedItem = await Category.findByIdAndUpdate({ _id: id }, { $set: data }, { new: true })
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
    return {success:false,message:error}
  }

}

module.exports = { addCategory, toggleIsList, updateCategory , deleteCategory }