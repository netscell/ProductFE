import axiosInstance from './axiosInstance';

// 获取所有促销
export const getAllPromotions = (params) => {
  return axiosInstance.get('/products/promotions', { params });
};

// 获取单个促销
export const getPromotion = (id) => {
  return axiosInstance.get(`/promotions/${id}`);
};

// 添加促销
export const addPromotion = (data) => {
  return axiosInstance.post('/product/promotion', data);
};

// 更新促销
export const updatePromotion = (id, data) => {
  return axiosInstance.put(`/promotions/${id}`, data);
};

// 删除促销
export const deletePromotion = (id) => {
  return axiosInstance.delete(`/product/promotion/${id}`);
};

// 添加促销到产品
export const addPromotionToProduct = (data) => {
  return axiosInstance.post('/product/addpromotion', data);
};
