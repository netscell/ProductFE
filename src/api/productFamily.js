import axiosInstance from './axiosInstance';

// 获取所有产品家族
export const getProductFamilies = (params) => {
  return axiosInstance.get('/productfamily', { params });
};

// 根据ID获取产品家族
export const getProductFamilyById = (id) => {
  return axiosInstance.get(`/productfamily/${id}`);
};

// 新增产品家族
export const createProductFamily = (data) => {
  return axiosInstance.post('/productfamily', data);
};

// 更新产品家族
export const updateProductFamily = (id, data) => {
  return axiosInstance.put(`/productfamily/${id}`, data);
};

// 删除产品家族
export const deleteProductFamily = (id) => {
  return axiosInstance.delete(`/productfamily/${id}`);
};

// 获取分类下的产品家族
export const getProductFamiliesByCategory = (categoryId) => {
  return axiosInstance.get(`/productfamily?subCategoryId=${categoryId}`);
};
