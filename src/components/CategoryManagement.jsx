import React, { useState, useEffect } from 'react';
import { 
  getAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../api/category';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    level: 1,
    parentId: null
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState('');

  // 获取所有分类
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      console.log('获取分类成功:', JSON.stringify(data.data));
      setCategories(data.data || []);
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  // 处理分类级别变化
  const handleLevelChange = (e) => {
    const level = parseInt(e.target.value);
    setNewCategory({
      ...newCategory,
      level,
      parentId: level === 1 ? null : ''
    });
  };

  // 添加分类
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await addCategory({
        name: newCategory.name,
        level: newCategory.level,
        parentId: newCategory.level === 1 ? null : newCategory.parentId
      });
      setMessage('分类添加成功');
      setNewCategory({
        name: '',
        level: 1,
        parentId: null
      });
      fetchCategories();
    } catch (err) {
      setMessage('分类添加失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 开始编辑分类
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      level: category.level,
      parentId: category.parentId || null
    });
  };

  // 更新分类
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, {
        name: newCategory.name,
        level: newCategory.level,
        parentId: newCategory.level === 1 ? null : newCategory.parentId
      });
      setMessage('分类更新成功');
      setEditingCategory(null);
      setNewCategory({
        name: '',
        level: 1,
        parentId: null
      });
      fetchCategories();
    } catch (err) {
      setMessage('分类更新失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id) => {
    if (window.confirm('确定要删除这个分类吗？')) {
      try {
        await deleteCategory(id);
        setMessage('分类删除成功');
        fetchCategories();
      } catch (err) {
        setMessage('分类删除失败: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // 获取指定级别的父分类
  const getParentCategories = (level) => {
    if (level === 1) return [];
    if (level === 2) return categories.map(x => ({ id: x.id, name: x.name }));// categories.filter(cat => cat.level === 1);
    if (level === 3) return categories.flatMap(x => x.subCategories || []); //categories.filter(cat => cat.level === 2);
    return [];
  };

  // 按级别分组显示分类
  const renderCategoriesByLevel = () => {
    const level1 = categories.map(x => ({ id: x.id, name: x.name }));//filter(cat => cat.level === 1);
    const level2 = categories.flatMap(x => x.subCategories || []);//filter(cat => cat.level === 2);
    const level3 = categories.flatMap(x => x.subCategories || []).flatMap(x => x.specifications || []);//filter(cat => cat.level === 3);

    return (
      <div>
        <h3>一级分类</h3>
        <ul>
          {level1.map(cat => (
            <li key={cat.id} style={{ marginBottom: '10px' }}>
              {cat.name}
              <button onClick={() => handleEditCategory(cat)} style={{ marginLeft: '10px', padding: '2px 5px' }}>编辑</button>
              <button onClick={() => handleDeleteCategory(cat.id)} style={{ marginLeft: '5px', padding: '2px 5px', color: 'red' }}>删除</button>
              
              {/* 显示二级分类 */}
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                {level2
                  .filter(subCat => subCat.parentId === cat.id)
                  .map(subCat => (
                    <li key={subCat.id} style={{ marginBottom: '8px' }}>
                      {subCat.name}
                      <button onClick={() => handleEditCategory(subCat)} style={{ marginLeft: '10px', padding: '2px 5px' }}>编辑</button>
                      <button onClick={() => handleDeleteCategory(subCat.id)} style={{ marginLeft: '5px', padding: '2px 5px', color: 'red' }}>删除</button>
                      
                      {/* 显示三级分类 */}
                      <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                        {level3
                          .filter(subSubCat => subSubCat.parentId === subCat.id)
                          .map(subSubCat => (
                            <li key={subSubCat.id}>
                              {subSubCat.name}
                              <button onClick={() => handleEditCategory(subSubCat)} style={{ marginLeft: '10px', padding: '2px 5px' }}>编辑</button>
                              <button onClick={() => handleDeleteCategory(subSubCat.id)} style={{ marginLeft: '5px', padding: '2px 5px', color: 'red' }}>删除</button>
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>商品分类管理</h2>
      
      {/* 分类表单 */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>{editingCategory ? '编辑分类' : '添加分类'}</h3>
        {message && <div style={{ marginBottom: '15px', color: message.includes('成功') ? 'green' : 'red' }}>{message}</div>}
        <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
          <div style={{ marginBottom: '15px' }}>
            <label>分类名称：</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>分类级别：</label>
            <select
              value={newCategory.level}
              onChange={handleLevelChange}
              style={{ padding: '8px', marginLeft: '10px' }}
            >
              <option value={1}>一级分类</option>
              <option value={2}>二级分类</option>
              <option value={3}>三级分类</option>
            </select>
          </div>
          
          {newCategory.level > 1 && (
            <div style={{ marginBottom: '15px' }}>
              <label>父分类：</label>
              <select
                value={newCategory.parentId || ''}
                onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                required
                style={{ padding: '8px', marginLeft: '10px' }}
              >
                <option value="">请选择父分类</option>
                {getParentCategories(newCategory.level).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {editingCategory ? '更新分类' : '添加分类'}
          </button>
          
          {editingCategory && (
            <button 
              type="button" 
              onClick={() => {
                setEditingCategory(null);
                setNewCategory({ name: '', level: 1, parentId: null });
              }}
              style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              取消编辑
            </button>
          )}
        </form>
      </div>
      
      {/* 分类列表 */}
      <div>
        <h3>分类列表</h3>
        {renderCategoriesByLevel()}
      </div>
    </div>
  );
};

export default CategoryManagement;