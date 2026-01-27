import axiosInstance from './axiosInstance';

// 上传多张图片
export const uploadImages = (images) => {
  const formData = new FormData();
  images.forEach(file => {
    formData.append('images', file);
  });

  return axiosInstance.post('/file/upload/multi', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 获取产品评论列表
export const getProductReviews = (productId) => {
  return axiosInstance.get(`/product/${productId}/reviews`);
};

// 添加产品评论
export const addProductReview = (reviewData, productId) => {
  return axiosInstance.post(`/product/${productId}/review`, reviewData);
};

// 编辑评论
export const updateReview = (reviewId, reviewData) => {
  return axiosInstance.put(`/product/review/${reviewId}`, reviewData);
};

// 删除评论
export const deleteReview = (reviewId) => {
  return axiosInstance.delete(`/product/review/${reviewId}`);
};
