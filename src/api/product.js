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
  return axiosInstance.get(`/productskus?productId=${productId}`);
};

// 添加产品SKU
export const addProductSku = (data) => {
  // 如果有图片文件,需要先单独上传图片
  if (data.image && (data.image instanceof File || (Array.isArray(data.image) && data.image.length > 0))) {
    const formData = new FormData();
    const images = Array.isArray(data.image) ? data.image : [data.image];
    images.forEach(file => {
      formData.append('images', file);
    });

    return axiosInstance.post('/file/upload/multi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      // 上传成功后,用返回的图片URL替换data中的image
      const dataWithoutImage = { ...data };
      delete dataWithoutImage.image;
      dataWithoutImage.imageUrls = response.data.files || response.data.urls || [];
      // 发送JSON数据
      return axiosInstance.post('/productsku', dataWithoutImage);
    });
  }

  // 没有图片,直接发送JSON数据
  const dataToSend = { ...data };
  if (dataToSend.image === null || dataToSend.image === undefined) {
    delete dataToSend.image;
  }
  return axiosInstance.post('/productsku', dataToSend);
};

// 更新产品SKU
export const updateProductSku = (id, data) => {
  // 如果有新图片文件,需要先单独上传图片
  if (data.image && (data.image instanceof File || (Array.isArray(data.image) && data.image.length > 0))) {
    const formData = new FormData();
    const images = Array.isArray(data.image) ? data.image : [data.image];
    images.forEach(file => {
      formData.append('images', file);
    });

    return axiosInstance.post('/file/upload/multi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      // 上传成功后,用返回的图片URL替换data中的image
      const dataWithoutImage = { ...data };
      delete dataWithoutImage.image;
      dataWithoutImage.imageUrls = response.data.imageUrls || response.data.urls || [];
      // 发送JSON数据
      return axiosInstance.put(`/productsku/${id}`, dataWithoutImage);
    });
  }

  // 没有新图片,直接发送JSON数据
  const dataToSend = { ...data };
  if (dataToSend.image === null || dataToSend.image === undefined) {
    delete dataToSend.image;
  }
  return axiosInstance.put(`/productsku/${id}`, dataToSend);
};

// 删除产品SKU
export const deleteProductSku = (id) => {
  return axiosInstance.delete(`/productsku/${id}`);
};

// 获取单个产品
export const getProduct = (id) => {
  return axiosInstance.get(`/productsku/${id}`);
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