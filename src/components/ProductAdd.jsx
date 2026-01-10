import React, { useState, useEffect } from 'react';
import { addProduct, uploadImages, uploadSpecificationExcel } from '../api/product';
import { getAllCategories } from '../api/category';

const ProductAdd = () => {
  // 分类状态
  const [allCategories, setAllCategories] = useState([]); // 所有分类
  const [level1Categories, setLevel1Categories] = useState([]); // 一级分类
  const [level2Categories, setLevel2Categories] = useState([]); // 二级分类
  const [level3Categories, setLevel3Categories] = useState([]); // 三级分类
  
  // 选中的分类ID
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [selectedLevel3, setSelectedLevel3] = useState([]); // 三级分类改为数组，支持多选
  
  const [formData, setFormData] = useState({
    name: '',
    UnitPrice: '',
    description: '',
    quantity: 0,
    categoryIds: [], // 将categoryId改为categoryIds数组
    images: [], // 存储图片文件
    imageUrls: [], // 存储上传后的图片地址
    specificationFile: null // 存储规格明细Excel文件
  });
  const [previewImages, setPreviewImages] = useState([]); // 预览图片数组
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [excelFileName, setExcelFileName] = useState(''); // Excel文件名显示

  // 获取所有分类
  useEffect(() => {
    fetchCategories();
  }, []);

  // 清理预览图片URL，避免内存泄漏
  useEffect(() => {
    return () => {
      previewImages.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [previewImages]);

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
    // 释放预览图片URL
    URL.revokeObjectURL(previewImages[index]);

    // 更新预览图片数组
    setPreviewImages(prev => prev.filter((_, i) => i !== index));

    // 更新图片文件数组
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // 处理Excel文件上传
  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedTypes.includes(file.type) && !['xlsx', 'xls'].includes(fileExtension)) {
        setMessage('请上传Excel文件（.xlsx 或 .xls格式）');
        return;
      }

      setFormData(prev => ({ ...prev, specificationFile: file }));
      setExcelFileName(file.name);
    }
  };

  // 删除Excel文件
  const removeExcelFile = () => {
    setFormData(prev => ({ ...prev, specificationFile: null }));
    setExcelFileName('');
  };

  // 添加产品
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // 验证是否选择了分类
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      setMessage('请至少选择一个三级分类');
      return;
    }

    // 验证是否选择了图片
    if (!formData.images || formData.images.length === 0) {
      setMessage('请至少选择一张图片');
      return;
    }

    try {
      setIsUploading(true);

      // 第一步：上传图片
      const uploadResponse = await uploadImages(formData.images);
      const imageUrls = uploadResponse.data.files || [];

      if (imageUrls.length === 0) {
        setMessage('图片上传失败');
        return;
      }

      // 第二步：如果有Excel文件，上传规格明细
      let specificationUrl = null;
      if (formData.specificationFile) {
        try {
          const excelResponse = await uploadSpecificationExcel(formData.specificationFile);
          console.log('excelResponse:', excelResponse);
          specificationUrl = excelResponse.data.fileName;
        } catch (excelErr) {
          setMessage('Excel文件上传失败: ' + (excelErr.response?.data?.message || excelErr.message));
          return;
        }
      }

      // 第三步：添加产品
      const productData = {
        name: formData.name,
        UnitPrice: formData.UnitPrice,
        description: formData.description,
        QuantityInStock: formData.quantity,
        SpecificationIds: formData.categoryIds,
        ImageUrls: imageUrls
      };

      // 如果有规格明细文件，添加到产品数据中
      if (specificationUrl) {
        productData.SpecFilePath = specificationUrl;
      }

      await addProduct(productData);

      setMessage('产品添加成功');

      // 重置表单
      setFormData({
        name: '',
        UnitPrice: '',
        description: '',
        categoryIds: [],
        images: [],
        imageUrls: [],
        specificationFile: null
      });
      setExcelFileName('');

      // 重置预览图片
      previewImages.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
      setPreviewImages([]);

      // 重置分类选择
      setSelectedLevel1('');
      setSelectedLevel2('');
      setSelectedLevel3([]);
      setLevel2Categories([]);
      setLevel3Categories([]);
    } catch (err) {
      setMessage('产品添加失败: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // 使用新的UI样式
  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">添加产品</h2>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="form">
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
              <label htmlFor="quantity" className="form-label">产品数量</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                step="1"
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
                
                {/* 三级分类选择（改为多选） */}
                {selectedLevel2 && (
                  <select
                    multiple // 添加multiple属性实现多选
                    value={selectedLevel3}
                    onChange={handleLevel3Change}
                    className="form-control"
                    style={{ minHeight: '120px' }} // 增加高度以便更好地显示多个选项
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
                multiple // 添加multiple属性实现多选
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

            {/* 产品规格明细Excel上传 */}
            <div className="form-group">
              <label htmlFor="excel" className="form-label">产品规格明细</label>
              <input
                type="file"
                id="excel"
                name="excel"
                onChange={handleExcelChange}
                accept=".xlsx,.xls"
                className="form-control"
              />
              <small className="form-text" style={{ marginTop: 'var(--spacing-xs)' }}>
                提示：请上传产品规格明细Excel文件（可选）
              </small>

              {/* 显示已选择的Excel文件 */}
              {excelFileName && (
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'var(--color-light)',
                  borderRadius: 'var(--border-radius)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>
                    📄 {excelFileName}
                  </span>
                  <button
                    type="button"
                    onClick={removeExcelFile}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: 'var(--color-danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    删除
                  </button>
                </div>
              )}
            </div>

            <div className="card-footer">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? '上传中...' : '添加产品'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;