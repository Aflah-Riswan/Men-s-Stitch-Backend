
const Category = require('../models/category')
const addCategory = async (data) => {
 
  if (data.parent === 'false' || data.parent === false || data.parent === 'none') {
    data.parent = null;
  }
  console.log("sanitaized data : ",data)
  const categoryExist = await Category.findOne({ name: data.name })
  if (categoryExist) return { success: false, message: 'already exist' }                                                                                                      
  const category = new Category(data)
  return await category.save()
}
const toggleIsList = async (categoryId) =>{
  const categoryItem = await Category.findById(categoryId)
  if(categoryItem){
    categoryItem.isListed = !categoryItem.isListed
    await categoryItem.save()
    return categoryItem
  }
  else{
    console.log("cant find the category item ")
  }
 
}
const updateCategory = 

module.exports = { addCategory ,toggleIsList}