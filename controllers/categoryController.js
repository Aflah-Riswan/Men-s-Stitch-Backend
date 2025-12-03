
const Category = require('../models/category')
const categoryService = require('../services/categoryService')

const createCategory = async (req, res) => {

  try {
    const data = req.body
    const result = await categoryService.addCategory(data)
    console.log(result)
    console.log("added succesfully")
  } catch (error) {
    console.log("error in categoryController ", error)
  }

}

const getAllCategories = async (req, res, next) => {
  console.log("inside get ALL CATEGORIUS ")
  try {
    const categories = await Category.find()
    res.json({ categories })
  } catch (error) {
    console.log("error in get all categories ",error)
  }

}
const toggleIsList = async (req,res)=>{
  const categoryId = req.params.id
  const response = await categoryService.toggleIsList(categoryId)
  res.json({updated:response})
}
const getCategoryById = async (req,res) =>{
  const categoryId = req.params.id
  const categoryItem  = await Category.findById(categoryId)
  res.json({categoryItem})
}

module.exports = { createCategory ,getAllCategories ,toggleIsList,getCategoryById}
