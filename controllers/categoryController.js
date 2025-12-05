
const Category = require('../models/category')
const categoryService = require('../services/categoryService')

const createCategory = async (req, res) => {

  try {
    const data = req.body

    const result = await categoryService.addCategory(data)
    if (result.success) return res.status(201).json(result)
    else return res.status(400).json(result)
  } catch (error) {
    console.log("error in categoryController ", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }

}

const getAllCategories = async (req, res, next) => {
  console.log("inside get ALL CATEGORIUS ")
  try {
    const categories = await Category.find({ isDeleted: false })
    return res.json({ categories })
  } catch (error) {
    console.log("error in get all categories ", error)
  }

}
const toggleIsList = async (req, res) => {
  const categoryId = req.params.id
  const response = await categoryService.toggleIsList(categoryId)
  res.json({ updated: response })
}
const getCategoryById = async (req, res) => {
  const categoryId = req.params.id
  const categoryItem = await Category.findById(categoryId)
  return res.json({ categoryItem })
}

const updateCategory = async (req, res) => {
  const { id } = req.params
  console.log("id : ", id)
  const response = await categoryService.updateCategory(id, req.body)
  console.log("response : ", response)
  if (response.success) {
    return res.status(201).json(response)
  } else {
    return res.status(400).json(response)
  }
}
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
   
    const response = await categoryService.deleteCategory(id)
     
    if(response.success) {
 
      return res.status(201).json({deletedItem:response.itemToDelete})
    }
    else {
      
      return res.status(400).json({error:response.message})
    }
  } catch (error) {
    return res.status(500).json({success : false,error })
  }

}

module.exports = { createCategory, getAllCategories, toggleIsList, getCategoryById, updateCategory ,deleteCategory }
