import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFootprints, clearFootprints, deleteFootprint, batchDeleteFootprint } from '../api/footprint';
import '../api/product';
import './Footprint.css';

const Footprint = () => {
  const [footprints, setFootprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFootprints, setSelectedFootprints] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFootprints();
  }, []);

  const fetchFootprints = async () => {
    try {
      setLoading(true);
      const response = await getFootprints();
      setFootprints(response.data);
    } catch (error) {
      console.error('获取足迹失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('确定要清空所有足迹吗？')) {
      try {
        await clearFootprints();
        setFootprints([]);
        setSelectedFootprints(new Set());
        setSelectAll(false);
      } catch (error) {
        console.error('清空足迹失败:', error);
      }
    }
  };

  // 处理单个删除
  const handleDeleteSingle = async (id) => {
    if (window.confirm('确定要删除这条足迹吗？')) {
      try {
        await deleteFootprint(id);
        // 重新获取数据以确保数据同步
        await fetchFootprints();
        // 清空选中状态
        setSelectedFootprints(new Set());
        setSelectAll(false);
      } catch (error) {
        console.error('删除足迹失败:', error);
      }
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedFootprints.size === 0) {
      alert('请选择要删除的足迹');
      return;
    }

    if (window.confirm(`确定要删除选中的 ${selectedFootprints.size} 条足迹吗？`)) {
      try {
        const idsToDelete = Array.from(selectedFootprints);
        await batchDeleteFootprint(idsToDelete);
        // 重新获取数据以确保数据同步
        await fetchFootprints();
        // 清空选中状态
        setSelectedFootprints(new Set());
        setSelectAll(false);
      } catch (error) {
        console.error('批量删除足迹失败:', error);
      }
    }
  };

  // 处理选中单个
  const handleSelect = (id) => {
    const newSelected = new Set(selectedFootprints);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFootprints(newSelected);

    // 检查是否全部选中
    setSelectAll(newSelected.size === footprints.length && footprints.length > 0);
  };

  // 处理全选
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    if (newSelectAll) {
      // 选中所有足迹的id
      setSelectedFootprints(new Set(footprints.map(fp => fp.id)));
    } else {
      setSelectedFootprints(new Set());
    }
    setSelectAll(newSelectAll);
  };

  // 按日期分组足迹
  const groupFootprintsByDate = (footprints) => {
    const grouped = {};
    footprints.forEach(footprint => {
      const date = new Date(footprint.viewdTime);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(footprint);
    });
    
    // 返回按日期降序排列的数组
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, items]) => ({ date, items }));
  };

  // 格式化日期显示
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="footprint-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  const groupedFootprints = groupFootprintsByDate(footprints);

  return (
    <div className="footprint-container">
      <div className="footprint-header">
        <div className="header-left">
          <h1>我的足迹</h1>
          {footprints.length > 0 && (
            <label className="select-all-container">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="select-all-checkbox"
              />
              <span>全选</span>
            </label>
          )}
        </div>
        <div className="header-right">
          {selectedFootprints.size > 0 && (
            <button className="batch-delete-btn" onClick={handleBatchDelete}>
              删除选中 ({selectedFootprints.size})
            </button>
          )}
          {footprints.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              清空所有
            </button>
          )}
        </div>
      </div>

      {!loading && footprints.length === 0 ? (
        <div className="footprint-empty">
          <div className="empty-icon">👣</div>
          <p>还没有浏览记录</p>
          <button className="browse-btn" onClick={() => navigate('/products')}>
            去逛逛
          </button>
        </div>
      ) : (
        <div className="footprint-list">
          {groupedFootprints.map(({ date, items }) => (
            <div key={date} className="footprint-date-group">
              <div className="footprint-date">
                <h3>{formatDate(date)}</h3>
              </div>
              <div className="footprint-items">
                {items.map((footprint, index) => (
                  <div key={`${footprint.id}-${index}`} className="footprint-item">
                    <div className="footprint-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedFootprints.has(footprint.id)}
                        onChange={() => handleSelect(footprint.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div
                      className="product-image-container"
                      onClick={() => handleProductClick(footprint.productSkuId)}
                    >
                      <img
                        alt={footprint.name}
                        src={`http://localhost:5192/api/file/view/${footprint.imageUrl}`}
                        className="product-image"
                      />
                    </div>
                    <div className="product-info">
                      <h4
                        className="product-name"
                        onClick={() => handleProductClick(footprint.productSkuId)}
                      >
                        {footprint.name}
                      </h4>
                      <p className="product-price">¥{Number(footprint.price).toFixed(2)}</p>
                      <p className="view-time">
                        {new Date(footprint.viewdTime).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      className="delete-single-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(footprint.id);
                      }}
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Footprint;
