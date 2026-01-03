import axiosInstance from './axiosInstance';

// 获取所有促销类型
export const getAllPromotionTypes = () => {
  return axiosInstance.get('/products/promotiontypes');
};

// 获取单个促销类型
export const getPromotionType = (id) => {
  return axiosInstance.get(`/promotion/types/${id}`);
};

// 添加促销类型
export const addPromotionType = (data) => {
  return axiosInstance.post('/product/promotiontype', data);
};

// 更新促销类型
export const updatePromotionType = (id, data) => {
  return axiosInstance.put(`/promotion/types/${id}`, data);
};

// 删除促销类型
export const deletePromotionType = (id) => {
  return axiosInstance.delete(`/product/promotiontype/${id}`);
};
