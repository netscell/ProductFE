import React, { useState, useEffect } from 'react';
import {
  getAllPromotionTypes,
  addPromotionType,
  updatePromotionType,
  deletePromotionType
} from '../api/promotionType';

const PromotionTypeManagement = () => {
  const [promotionTypes, setPromotionTypes] = useState([]);
  const [newType, setNewType] = useState({ name: '', description: '' });
  const [editingType, setEditingType] = useState(null);
  const [message, setMessage] = useState('');

  // 获取所有促销类型
  useEffect(() => {
    fetchPromotionTypes();
  }, []);

  const fetchPromotionTypes = async () => {
    try {
      const data = await getAllPromotionTypes();
      setPromotionTypes(data.data || []);
    } catch (err) {
      console.error('获取促销类型失败:', err);
    }
  };

  // 添加促销类型
  const handleAddType = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await addPromotionType({
        name: newType.name,
        description: newType.description
      });
      setMessage('促销类型添加成功');
      setNewType({ name: '', description: '' });
      fetchPromotionTypes();
    } catch (err) {
      setMessage('促销类型添加失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 开始编辑促销类型
  const handleEditType = (type) => {
    setEditingType(type);
    setNewType({ name: type.name, description: type.description });
  };

  // 更新促销类型
  const handleUpdateType = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!editingType) return;
    
    try {
      await updatePromotionType(editingType.id, {
        name: newType.name,
        description: newType.description
      });
      setMessage('促销类型更新成功');
      setEditingType(null);
      setNewType({ name: '', description: '' });
      fetchPromotionTypes();
    } catch (err) {
      setMessage('促销类型更新失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 删除促销类型
  const handleDeleteType = async (id) => {
    if (window.confirm('确定要删除这个促销类型吗？')) {
      try {
        await deletePromotionType(id);
        setMessage('促销类型删除成功');
        fetchPromotionTypes();
      } catch (err) {
        setMessage('促销类型删除失败: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>促销类型管理</h2>
      
      {/* 促销类型表单 */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>{editingType ? '编辑促销类型' : '添加促销类型'}</h3>
        {message && <div style={{ marginBottom: '15px', color: message.includes('成功') ? 'green' : 'red' }}>{message}</div>}
        <form onSubmit={editingType ? handleUpdateType : handleAddType}>
          <div style={{ marginBottom: '15px' }}>
            <label>促销类型名称：</label>
            <input
              type="text"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>促销类型描述：</label>
            <input
              type="text"
              value={newType.description}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {editingType ? '更新促销类型' : '添加促销类型'}
          </button>
          
          {editingType && (
            <button 
              type="button" 
              onClick={() => {
                setEditingType(null);
                setNewType({ name: '' });
              }}
              style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              取消编辑
            </button>
          )}
        </form>
      </div>
      
      {/* 促销类型列表 */}
      <div>
        <h3>促销类型列表</h3>
        {promotionTypes.length === 0 ? (
          <p>暂无促销类型</p>
        ) : (
          <ul>
            {promotionTypes.map(type => (
              <li key={type.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{type.name}</span>
                <div>
                  <button onClick={() => handleEditType(type)} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>编辑</button>
                  <button onClick={() => handleDeleteType(type.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>删除</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PromotionTypeManagement;
