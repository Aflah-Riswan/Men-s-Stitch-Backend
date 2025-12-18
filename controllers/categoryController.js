import Category from '../models/category.js';
import * as categoryService from '../services/categoryService.js';

export const createCategory = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await categoryService.addCategory(data);
    return res.status(201).json(result);
  } catch (error) {
    next(error)
  }
};

export const getAllCategories = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sort = '',
    category = '',
    discount = '',
    status = '',
    search = ''
  } = req.query;
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
    );
    return res.status(201).json({
      success: response.success,
      categories: response.categories,
      pagination: {
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNextPage: response.currentPage < response.totalProduct,
        hasPrevPage: response.currentPage > 1
      }
    });
  } catch (error) {
    next(error)
  }
};

export const toggleIsList = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const response = await categoryService.toggleIsList(categoryId);
    res.json({ updated: response });
  } catch (error) {
    next(error)
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const categoryItem = await Category.findOne({ slug: slug });
    return res.json({ categoryItem });
  } catch (error) {
    next(error)
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const response = await categoryService.updateCategory(slug, req.body);
    return res.status(201).json(response);
  } catch (error) {
    next(error)
  }

};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await categoryService.deleteCategory(id);
    return res.status(201).json({ deletedItem: response.itemToDelete })
  } catch (error) {
    next(error)
  }
};