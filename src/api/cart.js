import axiosInstance from './axiosInstance';

// 获取购物车内容
export const getCart = () => {
  return axiosInstance.get('/cart');
};

// 添加商品到购物车
export const addToCart = (productId, quantity = 1) => {
  return axiosInstance.post('/cart', {
    productId,
    quantity
  });
};

// 更新购物车中商品数量
export const updateCartItem = (itemId, quantity) => {
  return axiosInstance.put(`/cart/items/${itemId}`, {
    quantity
  });
};

// 删除购物车中的商品
export const removeFromCart = (itemId) => {
  return axiosInstance.delete(`/cart/items/${itemId}`);
};

// 清空购物车
export const clearCart = () => {
  return axiosInstance.delete('/cart');
};