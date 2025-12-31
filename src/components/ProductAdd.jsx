import React, { useState, useEffect } from 'react';
import { addProduct } from '../api/product';
import { getAllCategories } from '../api/category';

const ProductAdd = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');

  // 获取所有分类
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  // 处理表单字段变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理图片上传
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 添加产品
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // 创建FormData对象
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('price', formData.price);
    productData.append('description', formData.description);
    productData.append('categoryId', formData.categoryId);
    if (formData.image) {
      productData.append('image', formData.image);
    }
    
    try {
      await addProduct(productData);
      setMessage('产品添加成功');
      
      // 重置表单
      setFormData({
        name: '',
        price: '',
        description: '',
        categoryId: '',
        image: null
      });
      setPreviewImage(null);
    } catch (err) {
      setMessage('产品添加失败: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>添加产品</h2>
      {message && <div style={{ marginBottom: '15px', color: message.includes('成功') ? 'green' : 'red' }}>{message}</div>}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ marginBottom: '15px' }}>
          <label>产品名称：</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>产品价格：</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>产品描述：</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>产品分类：</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">请选择分类</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} (第{category.level}级)
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>产品图片：</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            style={{ marginTop: '5px' }}
          />
          {previewImage && (
            <div style={{ marginTop: '10px' }}>
              <img src={previewImage} alt="预览" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          添加产品
        </button>
      </form>
    </div>
  );
};

export default ProductAdd;