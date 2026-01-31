import React, { useState, useEffect } from 'react';
import {
  getProductFamilies,
  createProductFamily,
  updateProductFamily,
  deleteProductFamily
} from '../api/productFamily';
import './ProductFamily.css';

import {getLevel2Categories} from '../api/category';

const ProductFamily = () => {
  const [families, setFamilies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [message, setMessage] = useState('');

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subCategoryId: '',
    sortOrder: 0
  });

  useEffect(() => {
    fetchFamilies();
    fetchCategories();
  }, [searchKeyword]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const params = searchKeyword ? { keyword: searchKeyword } : {};
      const response = await getProductFamilies(params);
      setFamilies(response.data || []);
    } catch (error) {
      console.error('获取产品家族失败:', error);
      setMessage('获取产品家族失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // 从localStorage获取分类数据或从API获取
      const response = await getLevel2Categories()
      console.log('response', response.data);
      //const data = await response.data.json();
      // 过滤出二级分类
      //const subCategories = data.filter(cat => cat.parentId !== null);
      setCategories(response.data || []);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleOpenModal = (family = null) => {
    if (family) {
      setEditingFamily(family);
      setFormData({
        name: family.name,
        description: family.description || '',
        subCategoryId: family.subCategoryId,
        sortOrder: family.sortOrder || 0
      });
    } else {
      setEditingFamily(null);
      setFormData({
        name: '',
        description: '',
        subCategoryId: '',
        sortOrder: 0
      });
    }
    setShowModal(true);
    setMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFamily(null);
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage('请输入产品家族名称');
      return;
    }

    if (!formData.subCategoryId) {
      setMessage('请选择所属分类');
      return;
    }

    try {
      if (editingFamily) {
        await updateProductFamily(editingFamily.id, formData);
        setMessage('更新成功');
      } else {
        await createProductFamily(formData);
        setMessage('创建成功');
      }

      setTimeout(() => {
        handleCloseModal();
        fetchFamilies();
      }, 1000);
    } catch (error) {
      console.error('保存产品家族失败:', error);
      setMessage(error.response?.data?.message || '保存失败');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定要删除产品家族"${name}"吗？`)) {
      return;
    }

    try {
      await deleteProductFamily(id);
      setMessage('删除成功');
      fetchFamilies();

      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('删除产品家族失败:', error);
      setMessage('删除失败');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    return category ? category.name : '未知分类';
  };

  return (
    <div className="product-family-container">
      <div className="product-family-header">
        <h1>产品家族管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          新增产品家族
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索产品家族..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="family-list">
          <table className="family-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>描述</th>
                <th>所属分类</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {families.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    暂无数据
                  </td>
                </tr>
              ) : (
                families.map(family => (
                  <tr key={family.id}>
                    <td>{family.id}</td>
                    <td>{family.name}</td>
                    <td>{family.description || '-'}</td>
                    <td>{getCategoryName(family.subCategoryId)}</td>
                    <td>{family.sortOrder || 0}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenModal(family)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(family.id, family.name)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingFamily ? '编辑产品家族' : '新增产品家族'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">产品家族名称 *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="请输入产品家族名称"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">描述</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="请输入产品家族描述"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">所属二级分类 *</label>
                <select
                  name="subCategoryId"
                  className="form-control"
                  value={formData.subCategoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">请选择分类</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">排序</label>
                <input
                  type="number"
                  name="sortOrder"
                  className="form-control"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFamily ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFamily;
