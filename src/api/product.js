import axiosInstance from './axiosInstance';

// 获取所有产品
export const getAllProducts = (params) => {
  return axiosInstance.get('/products', { params });
};

// 获取单个产品
export const getProduct = (id) => {
  return axiosInstance.get(`/product/${id}`);
};

// 上传图片
export const uploadImages = (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  return axiosInstance.post('/file/upload/multi', formData,
    {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  } 
 );
};

// 添加产品
export const addProduct = (data) => {
  return axiosInstance.post('/product', data);
};

// 更新产品
export const updateProduct = (id, data) => {
  return axiosInstance.put(`/product/${id}`, data
    /*, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }*/
);
};

// 删除产品
export const deleteProduct = (id) => {
  return axiosInstance.delete(`/product/${id}`);
};