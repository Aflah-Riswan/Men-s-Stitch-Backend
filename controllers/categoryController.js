
const Category = require('../models/category')
const categoryService = require('../services/categoryService')

const createCategory = async (req, res) => {

  try {
    const data = req.body

    const result = await categoryService.addCategory(data)
    console.log("resulkt : ", result)
    if (result.success) return res.status(201).json(result)
    else return res.json(result)
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

  const {
    page = 1,
    limit = 5,
    sort = '',
    category = '',
    discount = '',
    status = '',
    search = ''
  } = req.query
  try {

    const response = await categoryService.getCategoryService(
      {
        page,
        limit,
        category,
        search,
        discount,
        sort,
        status
      }
    )
    console.log("response : ",response)

    if (response.success) {
      return res.status(201).json({
        success: response.success,
        categories: response.categories,
        pagination: {
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          hasNextPage: response.currentPage < response.totalProduct,
          hasPrevPage: response.currentPage > 1
        }

      })
    } else {
      return res.json({success: false , message : ' something found error'})
    }

  } catch (error) {
    console.log("error in get all categories ", error)
    return res.json({success: false , message : error.message})
  }

}
const toggleIsList = async (req, res) => {
  const categoryId = req.params.id
  const response = await categoryService.toggleIsList(categoryId)
  res.json({ updated: response })
}
const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params
  console.log("slug : ", slug)
  const categoryItem = await Category.findOne({ slug: slug })
  console.log("isExisted : ", categoryItem)
  return res.json({ categoryItem })
}

const updateCategory = async (req, res) => {
  const { slug } = req.params
  console.log("id : ", slug)
  const response = await categoryService.updateCategory(slug, req.body)
  console.log("response : ", response)
  if (response.success) {
    return res.status(201).json(response)
  } else {
    return res.json(response)
  }
}
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const response = await categoryService.deleteCategory(id)
    if (response.success) {
      return res.status(201).json({ deletedItem: response.itemToDelete })
    }
    else {
      return res.status(400).json({ error: response.message })
    }
  } catch (error) {
    return res.status(500).json({ success: false, error })
  }

}

module.exports = { createCategory, getAllCategories, toggleIsList, getCategoryBySlug, updateCategory, deleteCategory }
