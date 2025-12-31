import axiosInstance from './axiosInstance';

// 获取所有分类
export const getAllCategories = () => {
  return axiosInstance.get('/products/categories');
};

// 获取一级分类
export const getLevel1Categories = () => {
  return axiosInstance.get('/products/categories');
};

// 获取二级分类
export const getLevel2Categories = (parentId) => {
  return axiosInstance.get(`/products/subcategories`);
};

// 获取三级分类
export const getLevel3Categories = (parentId) => {
  return axiosInstance.get(`/products/specifications`);
};

// 添加分类
export const addCategory = (data) => {
  let url = ''
  data.Description = data.name + ".cat"
  if (data.level == 1) {
    url = '/product/category'    
  } else if (data.level == 2) {
    url = '/product/subcategory'
    data.CategoryId = data.parentId
  } else {
    url = '/product/specification'
    data.SubCategoryId = data.parentId
  }
  return axiosInstance.post(url, data);
};

// 更新分类
export const updateCategory = (id, data) => {
  return axiosInstance.put(`/categories/${id}`, data);
};

// 删除分类
export const deleteCategory = (id) => {
  return axiosInstance.delete(`/categories/${id}`);
};