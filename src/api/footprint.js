import axiosInstance from './axiosInstance';

// 获取用户足迹
export const getFootprints = () => {
  return axiosInstance.get('/user/browsehistory');
};

// 添加足迹
export const addFootprint = (productSkuId) => {
  return axiosInstance.post('/user/browsehistory', { productSkuId });
};

// 清空足迹
export const clearFootprints = () => {
  return axiosInstance.delete('/user/allbrowsehistory');
};

// 删除单个足迹
export const deleteFootprint = (recordId) => {
  return axiosInstance.delete(`/user/browsehistory/${recordId}`);
};


// 批量删除足迹
export const batchDeleteFootprint = (recordIds) => {
  return axiosInstance.post('/user/browsehistory', { ids: recordIds });
};

