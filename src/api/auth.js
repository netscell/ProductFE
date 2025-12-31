import axiosInstance from './axiosInstance';

// 登录
export const login = (data) => {
  return axiosInstance.post('/login', data);
};

// 注册
export const register = (data) => {
  return axiosInstance.post('/register', data);
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return axiosInstance.get('/current');
};