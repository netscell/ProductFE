import axiosInstance from './axiosInstance';

// 获取所有产品
export const getAllProducts = (params) => {
  return axiosInstance.get('/products', { params });
};

export const getAllProductSkus = (params) => {
  return axiosInstance.get('/productskus', { params });
};

// 获取指定产品的SKU
export const getProductSkus = (productId) => {
  return axiosInstance.get(`/product/${productId}/skus`);
};

// 添加产品SKU
export const addProductSku = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'image' && data[key] instanceof File) {
      formData.append('image', data[key]);
    } else {
      formData.append(key, data[key]);
    }
  });
  return axiosInstance.post('/productsku', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 更新产品SKU
export const updateProductSku = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'image' && data[key] instanceof File) {
      formData.append('image', data[key]);
    } else if (key === 'image' && data[key] === null) {
      // 如果image为null,表示不更新图片
    } else {
      formData.append(key, data[key]);
    }
  });
  return axiosInstance.put(`/productsku/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 删除产品SKU
export const deleteProductSku = (id) => {
  return axiosInstance.delete(`/productsku/${id}`);
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

// 上传产品规格明细Excel文件
export const uploadSpecificationExcel = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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