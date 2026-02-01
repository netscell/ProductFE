import React, { useState, useEffect } from 'react';
import { addProduct, uploadImages, uploadSpecificationExcel } from '../api/product';
import { getProductFamiliesByCategory } from '../api/productFamily';
import { getAllCategories } from '../api/category';
import axiosInstance from '../api/axiosInstance';

const ProductAdd = () => {
  // 分类状态
  const [allCategories, setAllCategories] = useState([]); // 所有分类
  const [level1Categories, setLevel1Categories] = useState([]); // 一级分类
  const [level2Categories, setLevel2Categories] = useState([]); // 二级分类
  const [level3Categories, setLevel3Categories] = useState([]); // 三级分类
  const [families, setFamilies] = useState([]); // 产品家族列表

  // 选中的分类ID
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [selectedLevel3, setSelectedLevel3] = useState([]); // 三级分类改为数组，支持多选
  const [selectedFamily, setSelectedFamily] = useState(''); // 选中的产品家族

  const [formData, setFormData] = useState({
    name: '',
    StartingPrice: '',
    description: '',
    //quantity: 0,
    imageUrl:'',
    categoryIds: [], // 将categoryId改为categoryIds数组
    productFamilyId: '', // 产品家族ID
    image: null, // 存储图片文件
    imageUrl: '', // 存储上传后的图片地址
    specificationFile: null // 存储规格明细Excel文件
  });
  const [previewImage, setPreviewImage] = useState(null); // 预览图片
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
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

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
    setSelectedFamily(''); // 重置产品家族
    setFamilies([]); // 清空产品家族列表
    setFormData(prev => ({ ...prev, categoryIds: [], productFamilyId: '' })); // 重置分类ID数组和产品家族

    // 过滤出对应的二级分类
    const level2 = allCategories.filter(x => x.id == level1Id).flatMap(x => x.subCategories || []);
    setLevel2Categories(level2);
    setLevel3Categories([]);
  };

  // 处理二级分类选择
  const handleLevel2Change = async (e) => {
    const level2Id = e.target.value;
    setSelectedLevel2(level2Id);
    setSelectedLevel3([]);
    setSelectedFamily(''); // 重置产品家族选择
    setFormData(prev => ({ ...prev, categoryIds: [], productFamilyId: '' })); // 重置分类ID数组和产品家族

    // 过滤出对应的三级分类
    const level3 = allCategories.flatMap(x => x.subCategories || [])
    .filter(x => x.id == level2Id).flatMap(x => x.specifications || []);
    setLevel3Categories(level3);

    // 加载该分类下的产品家族
    try {
      const response = await getProductFamiliesByCategory(level2Id);
      const familiesData = response.data || [];
      setFamilies(familiesData);
    } catch (error) {
      console.error('获取产品家族失败:', error);
      setFamilies([]);
    }
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
    const file = e.target.files[0]; // 获取选择的文件
    if (file) {
      // 保存选择的图片
      setFormData(prev => ({ ...prev, image: file }));

      // 创建预览图片URL
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 删除预览图片
  const removePreviewImage = () => {
    // 释放预览图片URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    // 清空预览图片
    setPreviewImage(null);

    // 清空图片文件
    setFormData(prev => ({ ...prev, image: null }));
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
    if (!formData.image) {
      setMessage('请选择一张图片');
      return;
    }

    try {
      setIsUploading(true);

      // 第一步：上传图片
      const formDataUpload = new FormData();
      formDataUpload.append('files', formData.image);
      const uploadResponse = await uploadImages(formDataUpload);
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
        StartingPrice: formData.StartingPrice,
        description: formData.description,
        SpecificationIds: formData.categoryIds,
        ProductFamilyId: formData.productFamilyId || undefined,
        imageUrl: imageUrls[0]
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
        StartingPrice: '',
        description: '',
        categoryIds: [],
        productFamilyId: '',
        image: null,
        imageUrl: '',
        specificationFile: null
      });
      setExcelFileName('');

      // 重置预览图片
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);

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
              <label htmlFor="price" className="form-label">产品起始价格</label>
              <input
                type="number"
                id="price"
                name="StartingPrice"
                value={formData.StartingPrice}
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

            {/* 产品家族选择 */}
            {selectedLevel2 && families.length > 0 && (
              <div className="form-group">
                <label htmlFor="productFamily" className="form-label">产品家族</label>
                <select
                  id="productFamily"
                  value={formData.productFamilyId}
                  onChange={(e) => setFormData({ ...formData, productFamilyId: e.target.value })}
                  className="form-control"
                >
                  <option value="">请选择产品家族</option>
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
                <small className="form-text" style={{ marginTop: 'var(--spacing-xs)' }}>
                  提示：选择产品家族后，该分类下其他属性会自动填充
                </small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="image" className="form-label">产品图片</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="form-control"
              />

              {/* 图片预览 */}
              {previewImage && (
                <div style={{ position: 'relative', marginTop: 'var(--spacing-sm)', display: 'inline-block' }}>
                  <img
                    src={previewImage}
                    alt="预览"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 'var(--border-radius)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removePreviewImage}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
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