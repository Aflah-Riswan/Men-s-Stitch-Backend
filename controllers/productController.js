import Products from '../models/products.js';
import * as productService from '../services/productService.js';


export const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    const response = await productService.createProductService(data);
   
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      sort = '',
      status = ''
    } = req.query;

    const response = await productService.getProductsService({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      status
    });

    return res.status(200).json({
      success: true,
      products: response.products,
      pagination: {
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNextPage: response.currentPage < response.totalPages,
        hasPrevPage: response.currentPage > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const productToggleIsList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await productService.productToggleIsList(id);
    return res.status(200).json({ success: true, updatedData: response.updatedData });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    return res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const response = await productService.updateProductService(id, data);
    return res.status(200).json({ success: true, updatedProduct: response.updatedProduct });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await productService.deleteProductService(id);
    return res.status(200).json({ success: true, deletedData: response.deletedData });
  } catch (error) {
    next(error);
  }
};

export const getProductsHome = async (req, res, next) => {
  try {
    const response = await productService.getProductHomeService();
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProductByIdHome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await productService.getProductByIdHomeService(id);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const queryParams = req.query;
    const response = await productService.getProductsByCategoryService(slug, queryParams);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

