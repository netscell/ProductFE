import React, { useState, useEffect } from 'react';
import {
  getAllPromotions,
  addPromotion,
  updatePromotion,
  deletePromotion
} from '../api/promotion';
import { getAllPromotionTypes } from '../api/promotionType';

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [promotionTypes, setPromotionTypes] = useState([]);
  const [newPromotion, setNewPromotion] = useState({ name: '', promotionTypeId: '',
    description: '', discountRate:0, discountAmount:0, limit:0
  });
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [message, setMessage] = useState('');

  // 获取所有促销和促销类型
  useEffect(() => {
    fetchPromotions();
    fetchPromotionTypes();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await getAllPromotions();
      setPromotions(data.data || []);
    } catch (err) {
      console.error('获取促销失败:', err);
    }
  };

  const fetchPromotionTypes = async () => {
    try {
      const data = await getAllPromotionTypes();
      setPromotionTypes(data.data || []);
    } catch (err) {
      console.error('获取促销类型失败:', err);
    }
  };

  // 添加促销
  const handleAddPromotion = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await addPromotion({
        name: newPromotion.name,
        promotionTypeId: newPromotion.promotionTypeId,
        description: newPromotion.description,
        discountRate: newPromotion.discountRate,
        discountAmount: newPromotion.discountAmount,
        limit: newPromotion.limit
      });
      setMessage('促销添加成功');
      setNewPromotion({ name: '', promotionTypeId: '',
        description: '', discountRate:0, discountAmount:0, limit:0
       });
      fetchPromotions();
    } catch (err) {
      setMessage('促销添加失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 开始编辑促销
  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setNewPromotion({
      name: promotion.name,
      promotionTypeId: promotion.promotionTypeId,
      description: promotion.description,
      discountRate: promotion.discountRate,
      discountAmount: promotion.discountAmount,
      limit: promotion.limit
    });
  };

  // 更新促销
  const handleUpdatePromotion = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!editingPromotion) return;
    
    try {
      await updatePromotion(editingPromotion.id, {
        name: newPromotion.name,
        promotionTypeId: newPromotion.promotionTypeId,
        description: newPromotion.description,
        discountRate: newPromotion.discountRate,
        discountAmount: newPromotion.discountAmount,
        limit: newPromotion.limit
      });
      setMessage('促销更新成功');
      setEditingPromotion(null);
      setNewPromotion({ name: '', promotionTypeId: '',
        description: '', discountRate:0, discountAmount:0, limit:0
       });
      fetchPromotions();
    } catch (err) {
      setMessage('促销更新失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 删除促销
  const handleDeletePromotion = async (id) => {
    if (window.confirm('确定要删除这个促销吗？')) {
      try {
        await deletePromotion(id);
        setMessage('促销删除成功');
        fetchPromotions();
      } catch (err) {
        setMessage('促销删除失败: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>促销管理</h2>
      
      {/* 促销表单 */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>{editingPromotion ? '编辑促销' : '添加促销'}</h3>
        {message && <div style={{ marginBottom: '15px', color: message.includes('成功') ? 'green' : 'red' }}>{message}</div>}
        <form onSubmit={editingPromotion ? handleUpdatePromotion : handleAddPromotion}>
          <div style={{ marginBottom: '15px' }}>
            <label>促销名称：</label>
            <input
              type="text"
              value={newPromotion.name}
              onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>促销类型：</label>
            <select
              value={newPromotion.promotionTypeId}
              onChange={(e) => setNewPromotion({ ...newPromotion, promotionTypeId: e.target.value })}
              required
              style={{ padding: '8px', marginLeft: '10px' }}
            >
              <option value="">请选择促销类型</option>
              {promotionTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>促销描述：</label>
            <input
              type="text"
              value={newPromotion.description}
              onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>折扣率：</label>
            <input
              type="number"
              value={newPromotion.discountRate}
              onChange={(e) => setNewPromotion({ ...newPromotion, discountRate: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>折扣金额：</label>
            <input
              type="number"
              value={newPromotion.discountAmount}
              onChange={(e) => setNewPromotion({ ...newPromotion, discountAmount: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>限量数量：</label>
            <input
              type="number"
              value={newPromotion.limit}
              onChange={(e) => setNewPromotion({ ...newPromotion, limit: e.target.value })}
              required
              style={{ width: '300px', padding: '8px', marginLeft: '10px' }}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {editingPromotion ? '更新促销' : '添加促销'}
          </button>
          
          {editingPromotion && (
            <button 
              type="button" 
              onClick={() => {
                setEditingPromotion(null);
                setNewPromotion({ name: '', promotionTypeId: '', description: '', discountRate: '', discountAmount: '', limit: '' });
              }}
              style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              取消编辑
            </button>
          )}
        </form>
      </div>
      
      {/* 促销列表 */}
      <div>
        <h3>促销列表</h3>
        {promotions.length === 0 ? (
          <p>暂无促销</p>
        ) : (
          <ul>
            {promotions.map(promotion => (
              <li key={promotion.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{promotion.name}</strong> - 
                  {promotionTypes.find(type => type.id === promotion.promotionTypeId)?.name || '未知类型'}
                </div>
                <div>
                  <button onClick={() => handleEditPromotion(promotion)} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>编辑</button>
                  <button onClick={() => handleDeletePromotion(promotion.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>删除</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PromotionManagement;
