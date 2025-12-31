import axiosInstance from './axiosInstance';

// 获取所有产品
export const getAllProducts = (params) => {
  return axiosInstance.get('/products', { params });
};

// 获取单个产品
export const getProduct = (id) => {
  return axiosInstance.get(`/products/${id}`);
};

// 添加产品
export const addProduct = (data) => {
  return axiosInstance.post('/products', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 更新产品
export const updateProduct = (id, data) => {
  return axiosInstance.put(`/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 删除产品
export const deleteProduct = (id) => {
  return axiosInstance.delete(`/products/${id}`);
};