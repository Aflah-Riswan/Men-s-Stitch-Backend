import Products from '../models/products.js';
import * as productService from '../services/productService.js';

export const createProduct = async (req, res) => {
  try {
    const data = req.body;
    const response = await productService.createProductService(data);
    if (response.success) return res.status(201).json(response);
    else return res.status(401).json(response);
  } catch (error) {
    console.log("error found  : ", error);
    // Fixed typo: res.satus -> res.status
    return res.status(400).json(error.message);
  }
};

export const getProducts = async (req, res) => {
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

    const response = await productService.getProductsService(
      {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        category,
        minPrice,
        maxPrice,
        sort,
        status
      }
    );

    if (response.success) {
      console.log("inside condition");
      return res.status(201).json({
        success: response.success,
        products: response.products,
        pagination: {
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          hasNextPage: response.currentPage < response.totalProduct,
          hasPrevPage: response.currentPage > 1
        }
      });
    } else {
      return res.json({ success: false, message: response.message });
    }

  } catch (error) {
    console.log("errror : ", error);
    return res.json({ success: false, message: error.message });
  }
};

export const productToggleIsList = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await productService.productToggleIsList(id);
    if (response.success) return res.json({ success: true, updatedData: response.updatedData });
    else return res.json({ success: false, message: response.message });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);
    if (!product) return res.json({ success: false, message: 'product is not found' });
    return res.json({ success: true, product });

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const response = await productService.updateProductService(id, data);
    console.log("response : ", response);
    if (response.success) {
      return res.status(201).json({ success: true, updatedProduct: response.updatedProduct });
    } else {
      return res.json({ success: false, message: response.message });
    }
  } catch (error) {
    return res.json({ success: false, message: error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await productService.deleteProductService(id);
    if (response.success) return res.json({ success: true, deletedData: response.deletedData });
    else return res.json({ success: false, message: response.message });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getProductsHome = async (req, res) => {
  try {
    const response = await productService.getProductHomeService();
    console.log(" response : ", response);
    if (response.success) {
      return res.json(response);
    } else {
      console.log(response);
      return res.json(response);
    }
  } catch (error) {
    console.log(" response : ", error);
    return res.json({ succcess: false, message: error.message });
  }
};

export const getProductByIdHome = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await productService.getProductByIdHomeService(id);
    if (response.success) {
      return res.json(response);
    } else {
      console.log(response);
      return res.json(response);
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: true, message: 'something went wrong ' });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { slug } = req.params;
  const queryParams = req.query;
  console.log(slug);
  try {
    const response = await productService.getProductsByCategoryService(slug, queryParams);
    return res.json(response);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};