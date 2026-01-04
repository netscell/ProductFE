import axiosInstance from './axiosInstance';

// 获取购物车内容
export const getCart = () => {
  return axiosInstance.get('/product/cart');
};

// 添加商品到购物车
export const addToCart = (req) => {
  return axiosInstance.post('/product/addtocart', req);
};

export const deleteCartItem = (itemId) => {
  return axiosInstance.delete(`/product/cartitem/${itemId}`);
};

// 更新购物车中商品数量
export const updateCartItem = (itemId, quantity) => {
  return axiosInstance.patch(`/product/cartitem/changequantity`, {
    newQuantity: quantity,
    CartItemId: itemId
  });
};

// 删除购物车中的商品
export const removeFromCart = (itemId) => {
  return axiosInstance.delete(`/product/cartitem/${itemId}`);
};

// 清空购物车
export const clearCart = () => {
  return axiosInstance.delete('/product/cart');
};