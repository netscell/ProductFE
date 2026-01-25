import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, getProduct, updateProduct, deleteProduct, uploadImages, getAllProductSkus, getProductSkus, addProductSku, updateProductSku, deleteProductSku } from '../api/product';
import { getAllCategories } from '../api/category';
import { getAllPromotions, addPromotionToProduct } from '../api/promotion';

const ProductManagement = () => {
  const navigate = useNavigate();

  // 产品列表状态
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // 编辑产品状态
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 分类状态
  const [allCategories, setAllCategories] = useState([]); // 所有分类
  const [level1Categories, setLevel1Categories] = useState([]); // 一级分类
  const [level2Categories, setLevel2Categories] = useState([]); // 二级分类
  const [level3Categories, setLevel3Categories] = useState([]); // 三级分类
  
  // 选中的分类ID
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [selectedLevel3, setSelectedLevel3] = useState([]); // 三级分类改为数组，支持多选

  // 产品表单数据
  const [formData, setFormData] = useState({
    name: '',
    UnitPrice: '',
    description: '',
    quantity: 0,
    categoryIds: [], // 将categoryId改为categoryIds数组
    images: [], // 存储图片文件
    imageUrls: [], // 存储上传后的图片地址,
    promotionNames: [] // 促销name数组
  });
  const [previewImages, setPreviewImages] = useState([]); // 预览图片数组

  // 促销相关状态
  const [promotions, setPromotions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionStartTime, setPromotionStartTime] = useState('');
  const [promotionEndTime, setPromotionEndTime] = useState('');

  // SKU相关状态
  const [showSkuModal, setShowSkuModal] = useState(false);
  const [skuProduct, setSkuProduct] = useState(null);
  const [productSkus, setProductSkus] = useState([]);
  const [editingSku, setEditingSku] = useState(null);
  const [isEditingSku, setIsEditingSku] = useState(false);
  const [skuFormData, setSkuFormData] = useState({
    skuCode: '',
    price: '',
    stock: 0,
    attributes: [], // [{ name: '颜色', value: '红色' }, { name: '尺寸', value: 'M' }]
    image: null,
  });
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
  const [skuImagePreviews, setSkuImagePreviews] = useState([]);

  // 获取所有产品
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize]);

  // 获取所有分类
  useEffect(() => {
    fetchCategories();
  }, []);

  // 获取所有促销
  useEffect(() => {
    fetchPromotions();
  }, []);

  // 清理预览图片URL，避免内存泄漏
  useEffect(() => {
    return () => {
      previewImages.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [previewImages]);

  // 获取产品列表
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts({
        page: currentPage,
        size: pageSize
      });
      setProducts(response.data);
      setTotalPages(response.data.length);
      setError(null);
    } catch (err) {
      setError('获取产品列表失败，请稍后重试');
      console.error('获取产品列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有分类
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      const categories = response.data || [];
      setAllCategories(categories);
      
      // 过滤出一级分类
      const level1 = categories.map(x => ({ id: x.id, name: x.name }));
      setLevel1Categories(level1);
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  // 获取所有促销
  const fetchPromotions = async () => {
    try {
      const response = await getAllPromotions();
      setPromotions(response.data || []);
    } catch (err) {
      console.error('获取促销列表失败:', err);
    }
  };

  // 处理分页变化
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 删除产品
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('确定要删除这个产品吗？')) {
      try {
        await deleteProduct(productId);
        setMessage('产品删除成功');
        fetchProducts(); // 重新加载产品列表
      } catch (err) {
        setMessage('产品删除失败');
        console.error('删除产品失败:', err);
      }
    }
  };

  // 开始编辑产品
  const handleEditProduct = async (productId) => {
    try {
      setLoading(true);
      const response = await getProduct(productId);
      const product = response.data;
      console.log('product', product);
      setEditingProduct(product);
      
      // 填充表单数据
      setFormData({
        name: product.name || '',
        UnitPrice: product.unitPrice || '',
        description: product.description || '',
        quantity: product.quantityInStock || 0,
        categoryIds: product.specificationIds || [],
        images: [],
        imageUrls: product.imageUrls || [],
        promotionNames: product.promotions || [] // 促销name数组
      });
      
      // 设置预览图片
      setPreviewImages(product.imageUrls || []);
      
      // 设置分类选择
      // 这里需要根据产品的分类ID找到对应的一级、二级分类
      // 由于分类结构较为复杂，这里简化处理
      setIsEditing(true);
      setError(null);
    } catch (err) {
      setError('获取产品详情失败');
      console.error('获取产品详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      UnitPrice: '',
      description: '',
      quantity: 0,
      categoryIds: [],
      images: [],
      imageUrls: [],
      promotionNames: [] // 促销name数组
    });
    setPreviewImages([]);
    setSelectedLevel1('');
    setSelectedLevel2('');
    setSelectedLevel3([]);
  };

  // 处理一级分类选择
  const handleLevel1Change = (e) => {
    const level1Id = e.target.value;
    setSelectedLevel1(level1Id);
    setSelectedLevel2('');
    setSelectedLevel3([]);
    setFormData(prev => ({ ...prev, categoryIds: [] })); // 重置分类ID数组
    
    // 过滤出对应的二级分类
    const level2 = allCategories.filter(x => x.id == level1Id).flatMap(x => x.subCategories || []);
    setLevel2Categories(level2);
    setLevel3Categories([]);
  };

  // 处理二级分类选择
  const handleLevel2Change = (e) => {
    const level2Id = e.target.value;
    setSelectedLevel2(level2Id);
    setSelectedLevel3([]);
    setFormData(prev => ({ ...prev, categoryIds: [] })); // 重置分类ID数组
    
    // 过滤出对应的三级分类
    const level3 = allCategories.flatMap(x => x.subCategories || [])
    .filter(x => x.id == level2Id).flatMap(x => x.specifications || []);
    setLevel3Categories(level3);
  };

  // 处理三级分类选择（多选）
  const handleLevel3Change = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedLevel3(selectedOptions);
    
    // 更新最终选择的分类ID数组
    setFormData(prev => ({ ...prev, categoryIds: selectedOptions }));
  };

  // 处理表单字段变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理图片上传
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // 获取所有选择的文件
    if (files.length > 0) {
      // 保存选择的图片
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
      
      // 创建预览图片URL
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
      
      // 清空文件输入，允许重新选择相同文件
      e.target.value = '';
    }
  };

  // 删除预览图片
  const removePreviewImage = (index) => {
    // 释放预览图片URL（如果是本地文件）
    if (previewImages[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewImages[index]);
    }
    
    // 更新预览图片数组
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // 更新图片文件数组
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const newImageUrls = prev.imageUrls.filter((_, i) => i !== index);
      return { ...prev, images: newImages, imageUrls: newImageUrls };
    });
  };

  // 更新产品
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // 验证是否选择了分类
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      setMessage('请至少选择一个三级分类');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // 如果有新上传的图片，先上传图片
      let imageUrls = formData.imageUrls;
      if (formData.images.length > 0) {
        const uploadResponse = await uploadImages(formData.images);
        const newImageUrls = uploadResponse.data.imageUrls || [];
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      
      if (imageUrls.length === 0) {
        setMessage('产品至少需要一张图片');
        return;
      }
      
      // 更新产品
      const productData = {
        name: formData.name,
        UnitPrice: formData.UnitPrice,
        description: formData.description,
        QuantityInStock: formData.quantity,
        SpecificationIds: formData.categoryIds,
        ImageUrls: imageUrls
      };
      
      await updateProduct(editingProduct.id, productData);
      
      setMessage('产品更新成功');
      
      // 重置表单并刷新产品列表
      handleCancelEdit();
      fetchProducts();
    } catch (err) {
      setMessage('产品更新失败: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // 打开促销选择模态框
  const openPromotionModal = (product) => {
    setSelectedProduct(product);
    setSelectedPromotions([]);
    setPromotionStartTime('');
    setPromotionEndTime('');
    setShowPromotionModal(true);
  };

  // 关闭促销选择模态框
  const closePromotionModal = () => {
    setShowPromotionModal(false);
    setSelectedProduct(null);
    setSelectedPromotions([]);
    setPromotionStartTime('');
    setPromotionEndTime('');
  };

  // 处理促销选择变化
  const handlePromotionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedPromotions(selectedOptions);
  };

  // 提交促销
  const submitPromotions = async () => {
    if (!selectedProduct || selectedPromotions.length === 0) {
      setMessage('请选择至少一个促销');
      return;
    }

    if (!promotionStartTime) {
      setMessage('请选择促销开始时间');
      return;
    }

    if (!promotionEndTime) {
      setMessage('请选择促销结束时间');
      return;
    }

    if (new Date(promotionStartTime) >= new Date(promotionEndTime)) {
      setMessage('促销结束时间必须晚于开始时间');
      return;
    }

    try {
      // 为每个选择的促销调用API
      for (const promotionId of selectedPromotions) {

      }

      // 当前提交一个促销
      await addPromotionToProduct({
          productId: selectedProduct.id,
          promotionId: selectedPromotions[0],
          startDate: promotionStartTime,
          endDate: promotionEndTime
        });

      setMessage('促销添加成功');
      closePromotionModal();
      fetchProducts(); // 刷新产品列表
    } catch (err) {
      setMessage('促销添加失败: ' + (err.response?.data?.message || err.message));
      console.error('添加促销失败:', err);
    }
  };

  // 打开SKU管理模态框
  const openSkuModal = async (product) => {
    setSkuProduct(product);
    setMessage(''); // 清空之前的错误消息
    try {
      const response = await getProductSkus(product.id);
      setProductSkus(response.data || []);
    } catch (err) {
      console.error('获取SKU列表失败:', err);
      setProductSkus([]);
    }
    setShowSkuModal(true);
  };

  // 关闭SKU管理模态框
  const closeSkuModal = () => {
    setShowSkuModal(false);
    setSkuProduct(null);
    setProductSkus([]);
    resetSkuForm();
  };

  // 重置SKU表单
  const resetSkuForm = () => {
    setEditingSku(null);
    setIsEditingSku(false);
    setSkuFormData({
      skuCode: '',
      price: '',
      stock: 0,
      attributes: [],
      image: null
    });
    setNewAttribute({ name: '', value: '' });
    setSkuImagePreviews([]);
  };

  // 添加属性
  const addAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setSkuFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }]
      }));
      setNewAttribute({ name: '', value: '' });
    }
  };

  // 删除属性
  const removeAttribute = (index) => {
    setSkuFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  // 处理SKU表单变化
  const handleSkuChange = (e) => {
    const { name, value } = e.target;
    setSkuFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理SKU图片上传
  const handleSkuImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSkuFormData(prev => ({ ...prev, image: files }));
      // 创建预览
      const previews = files.map(file => URL.createObjectURL(file));
      setSkuImagePreviews(previews);
    }
  };

  // 删除单个SKU图片
  const removeSkuImage = (index) => {
    if (skuImagePreviews[index]) {
      URL.revokeObjectURL(skuImagePreviews[index]);
    }
    setSkuImagePreviews(prev => prev.filter((_, i) => i !== index));
    const newImages = Array.isArray(skuFormData.image) ? skuFormData.image.filter((_, i) => i !== index) : null;
    setSkuFormData(prev => ({ ...prev, image: newImages }));
  };

  // 开始编辑SKU
  const handleEditSku = (sku) => {
    setEditingSku(sku);
    setIsEditingSku(true);
    // 解析attributes字符串或使用已解析的数组
    const attributes = typeof sku.attributes === 'string' ? JSON.parse(sku.attributes) : (sku.attributes || []);
    setSkuFormData({
      skuCode: sku.skuCode || '',
      price: sku.price || sku.unitPrice || '',
      stock: sku.stock || sku.quantityInStock || 0,
      attributes: attributes,
      image: null,
      imageUrls: sku.imageUrls || []
    });
    // 设置图片预览 (支持多个图片)
    if (sku.imageUrls && sku.imageUrls.length > 0) {
      const previews = sku.imageUrls.map(url => `http://localhost:5192/api/file/view/${url}`);
      setSkuImagePreviews(previews);
    } else if (sku.imageUrl) {
      setSkuImagePreviews([`http://localhost:5192/api/file/view/${sku.imageUrl}`]);
    } else {
      setSkuImagePreviews([]);
    }
  };

  // 取消编辑SKU
  const handleCancelEditSku = () => {
    resetSkuForm();
  };

  // 提交SKU
  const submitSku = async () => {
    if (!skuFormData.skuCode) {
      setMessage('请输入SKU编码');
      return;
    }
    if (!skuFormData.price) {
      setMessage('请输入SKU价格');
      return;
    }

    setMessage(''); // 清空之前的错误消息

    try {
      const skuData = {
        productId: skuProduct.id,
        skuCode: skuFormData.skuCode,
        unitPrice: parseFloat(skuFormData.price),
        quantityInStock: parseInt(skuFormData.stock),
        attributes: JSON.stringify(skuFormData.attributes),
        
      };

      // 如果有图片,添加到数据中
      if (skuFormData.image) {
        skuData.image = skuFormData.image;
      }

      if (isEditingSku && editingSku) {
        await updateProductSku(editingSku.id, skuData);
        setMessage('SKU更新成功');
      } else {
        await addProductSku(skuData);
        setMessage('SKU添加成功');
      }

      // 刷新SKU列表
      const response = await getProductSkus(skuProduct.id);
      setProductSkus(response.data || []);

      resetSkuForm();
    } catch (err) {
      setMessage('SKU操作失败: ' + (err.response?.data?.message || err.message));
      console.error('SKU操作失败:', err);
    }
  };

  // 删除SKU
  const handleDeleteSku = async (skuId) => {
    if (window.confirm('确定要删除这个SKU吗？')) {
      try {
        await deleteProductSku(skuId);
        setMessage('SKU删除成功');

        // 刷新SKU列表
        const response = await getProductSkus(skuProduct.id);
        setProductSkus(response.data || []);
      } catch (err) {
        setMessage('SKU删除失败: ' + (err.response?.data?.message || err.message));
        console.error('删除SKU失败:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading"><div className="loading-spinner"></div></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">产品管理</h2>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}
          
          {isEditing ? (
            // 编辑产品表单
            <div className="page-container" style={{ maxWidth: '600px' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">编辑产品</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleUpdateProduct} encType="multipart/form-data" className="form">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">产品名称</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="price" className="form-label">产品价格</label>
                      <input
                        type="number"
                        id="price"
                        name="UnitPrice"
                        value={formData.UnitPrice}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="description" className="form-label">产品描述</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="quantity" className="form-label">库存数量</label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="0"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="promotion" className="form-label">促销</label>
                      <input
                        type="text"
                        id="promotion"
                        name="promotionNames"
                        value={formData.promotionNames.join(', ')}
                        onChange={handleChange}
                        required
                        min="0"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">产品分类</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* 一级分类选择 */}
                        <select
                          value={selectedLevel1}
                          onChange={handleLevel1Change}
                          className="form-control"
                          style={{ marginBottom: 'var(--spacing-sm)' }}
                        >
                          <option value="">请选择一级分类</option>
                          {level1Categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        
                        {/* 二级分类选择 */}
                        {selectedLevel1 && (
                          <select
                            value={selectedLevel2}
                            onChange={handleLevel2Change}
                            className="form-control"
                            style={{ marginBottom: 'var(--spacing-sm)' }}
                          >
                            <option value="">请选择二级分类</option>
                            {level2Categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {/* 三级分类选择（多选） */}
                        {selectedLevel2 && (
                          <select
                            multiple // 添加multiple属性实现多选
                            value={selectedLevel3}
                            onChange={handleLevel3Change}
                            className="form-control"
                            style={{ minHeight: '120px' }}
                          >
                            {level3Categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <small className="form-text" style={{ marginTop: 'var(--spacing-xs)' }}>
                        提示：按住Ctrl键（Windows）或Command键（Mac）可选择多个三级分类
                      </small>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="image" className="form-label">产品图片</label>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="form-control"
                      />
                      <small className="form-text" style={{ marginTop: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                        提示：按住Ctrl键（Windows）或Command键（Mac）可选择多张图片
                      </small>
                      
                      {/* 图片预览列表 */}
                      {previewImages.length > 0 && (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                          gap: 'var(--spacing-sm)',
                          marginTop: 'var(--spacing-sm)'
                        }}>
                          {previewImages.map((preview, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                              <img 
                                src={preview} 
                                alt={`预览 ${index + 1}`} 
                                style={{ 
                                  width: '100%', 
                                  height: '100px', 
                                  objectFit: 'cover', 
                                  borderRadius: 'var(--border-radius)' 
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removePreviewImage(index)}
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  right: '-8px',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--color-danger)',
                                  color: 'white',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  lineHeight: '1'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isUploading}
                      >
                        {isUploading ? '更新中...' : '更新产品'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleCancelEdit}
                        style={{ marginLeft: 'var(--spacing-sm)' }}
                      >
                        取消
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            // 产品列表
            <>
              {products.length === 0 ? (
                <div className="empty-state">
                  <h3>暂无产品</h3>
                  <p>请先添加产品</p>
                </div>
              ) : (
                <div className="grid grid-cols-4">
                  {products.map(product => (
                    <div key={product.id} className="card">
                      <div className="card-body">
                        <div
                          onClick={() => navigate(`/product/${product.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={`http://localhost:5192/api/file/view/${product.imageUrls?.[0]}`}
                            alt={product.name}
                            className="img-responsive img-preview mb-3"
                            style={{
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: 'var(--border-radius)',
                              transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          />
                          <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>
                            {product.name}
                          </h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
                            {product.description?.substring(0, 50)}...
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                              ¥{product.unitPrice?.toFixed(2) || product.price?.toFixed(2)}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              库存: {product.quantityInStock || 0}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="btn btn-secondary w-full"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="btn btn-danger w-full"
                          >
                            删除
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                          <button
                            onClick={() => openPromotionModal(product)}
                            className="btn btn-primary w-full"
                          >
                            添加促销
                          </button>
                          <button
                            onClick={() => openSkuModal(product)}
                            className="btn btn-info w-full"
                          >
                            管理SKU
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {totalPages > 1 && !isEditing && (
          <div className="card-footer">
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                首页
              </button>
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                末页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 促销选择模态框 */}
      {showPromotionModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">为产品添加促销</h3>
              <button
                className="modal-close"
                onClick={closePromotionModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <h4>{selectedProduct.name}</h4>
              <div className="form-group">
                <label className="form-label">选择促销</label>
                <select
                  multiple
                  value={selectedPromotions}
                  onChange={handlePromotionChange}
                  className="form-control"
                  style={{ minHeight: '150px' }}
                >
                  {promotions.map(promotion => (
                    <option key={promotion.id} value={promotion.id}>
                      {promotion.name} - {promotion.description}
                    </option>
                  ))}
                </select>
                <small className="form-text" style={{ marginTop: 'var(--spacing-xs)' }}>
                  提示：按住Ctrl键（Windows）或Command键（Mac）可选择多个促销
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">促销开始时间</label>
                <input
                  type="datetime-local"
                  value={promotionStartTime}
                  onChange={(e) => setPromotionStartTime(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">促销结束时间</label>
                <input
                  type="datetime-local"
                  value={promotionEndTime}
                  onChange={(e) => setPromotionEndTime(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={submitPromotions}
              >
                确认添加
              </button>
              <button
                className="btn btn-secondary"
                onClick={closePromotionModal}
                style={{ marginLeft: 'var(--spacing-sm)' }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKU管理模态框 */}
      {showSkuModal && skuProduct && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">管理SKU - {skuProduct.name}</h3>
              <button
                className="modal-close"
                onClick={closeSkuModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {message && (
                <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
                  {message}
                </div>
              )}

              {/* SKU表单 */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--color-light)',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ marginBottom: '1rem' }}>{isEditingSku ? '编辑SKU' : '添加新SKU'}</h4>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">SKU编码</label>
                  <input
                    type="text"
                    name="skuCode"
                    value={skuFormData.skuCode}
                    onChange={handleSkuChange}
                    placeholder="例如: P001-RED-M"
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: '1rem' }}>
                    <label className="form-label">价格</label>
                    <input
                      type="number"
                      name="price"
                      value={skuFormData.price}
                      onChange={handleSkuChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1, marginBottom: '1rem' }}>
                    <label className="form-label">库存</label>
                    <input
                      type="number"
                      name="stock"
                      value={skuFormData.stock}
                      onChange={handleSkuChange}
                      placeholder="0"
                      min="0"
                      className="form-control"
                    />
                  </div>
                </div>

                {/* SKU图片上传 */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">SKU图片</label>
                  <input
                    type="file"
                    onChange={handleSkuImageChange}
                    accept="image/*"
                    multiple
                    className="form-control"
                  />
                  <small className="form-text" style={{ marginTop: 'var(--spacing-xs)' }}>
                    提示：按住Ctrl键（Windows）或Command键（Mac）可选择多张图片
                  </small>
                  {/* 图片预览 */}
                  {skuImagePreviews.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      {skuImagePreviews.map((preview, index) => (
                        <div key={index} style={{
                          position: 'relative',
                          display: 'inline-block'
                        }}>
                          <img
                            src={preview}
                            alt={`SKU预览 ${index + 1}`}
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: 'var(--border-radius)',
                              border: '2px solid var(--border-color)'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeSkuImage(index)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-danger)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              lineHeight: '1'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 属性管理 */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    SKU属性
                  </label>

                  {/* 已添加的属性列表 */}
                  {skuFormData.attributes.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      {skuFormData.attributes.map((attr, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            borderRadius: '16px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {attr.name}: {attr.value}
                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '1rem',
                              lineHeight: 1,
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 添加新属性 */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newAttribute.name}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="属性名称 (如: 颜色)"
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={newAttribute.value}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="属性值 (如: 红色)"
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="btn btn-primary"
                      disabled={!newAttribute.name || !newAttribute.value}
                    >
                      添加
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={submitSku}
                    className="btn btn-primary"
                  >
                    {isEditingSku ? '更新SKU' : '添加SKU'}
                  </button>
                  {isEditingSku && (
                    <button
                      onClick={handleCancelEditSku}
                      className="btn btn-secondary"
                    >
                      取消编辑
                    </button>
                  )}
                </div>
              </div>

              {/* SKU列表 */}
              <div>
                <h4 style={{ marginBottom: '1rem' }}>SKU列表</h4>
                {productSkus.length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-light)',
                    borderRadius: 'var(--border-radius)'
                  }}>
                    <p style={{ color: 'var(--text-muted)' }}>暂无SKU</p>
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {productSkus.map(sku => {
                      // 解析attributes
                      const attributes = typeof sku.attributes === 'string' ? JSON.parse(sku.attributes) : (sku.attributes || []);

                      return (
                        <div
                          key={sku.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            marginBottom: '0.5rem',
                            backgroundColor: 'var(--color-light)',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                            {/* SKU图片 (显示第一张) */}
                            {sku.imageUrls && sku.imageUrls.length > 0 && (
                              <img
                                src={`http://localhost:5192/api/file/view/${sku.imageUrls[0]}`}
                                alt={sku.skuCode}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: 'var(--border-radius)',
                                  border: '1px solid var(--border-color)'
                                }}
                              />
                            )}
                            {sku.imageUrl && !sku.imageUrls && (
                              <img
                                src={`http://localhost:5192/api/file/view/${sku.imageUrl}`}
                                alt={sku.skuCode}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: 'var(--border-radius)',
                                  border: '1px solid var(--border-color)'
                                }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                {sku.skuCode}
                              </div>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                价格: ¥{(sku.price || sku.unitPrice)?.toFixed(2)} | 库存: {sku.stock || sku.quantityInStock}
                              </div>
                              {attributes.length > 0 && (
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '0.25rem',
                                  marginTop: '0.25rem'
                                }}>
                                  {attributes.map((attr, idx) => (
                                    <span
                                      key={idx}
                                      style={{
                                        fontSize: '0.8rem',
                                        padding: '0.125rem 0.5rem',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      {attr.name}: {attr.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleEditSku(sku)}
                              className="btn btn-secondary"
                              style={{ padding: '0.5rem 1rem' }}
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteSku(sku.id)}
                              className="btn btn-danger"
                              style={{ padding: '0.5rem 1rem' }}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
