import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../api/product';
import { addToCart } from '../api/cart';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 获取产品列表
  useEffect(() => {
    fetchProducts(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchProducts = async (page, size) => {
    try {
      const params = {
        page,
        size
      };
      const response = await getAllProducts(params);
      setProducts(response.data || []);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      console.error('获取产品列表失败:', err);
      setMessage('获取产品列表失败');
    }
  };

  // 处理分页变更
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 处理每页显示数量变更
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // 重置到第一页
  };

  // 添加到购物车
  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId);
      setMessage('添加到购物车成功');
      // 3秒后清除消息
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('添加到购物车失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 格式化价格
  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price);
  };

  // 生成分页按钮
  const renderPagination = () => {
    const pages = [];
    
    // 总是显示第一页
    if (currentPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          style={{ margin: '0 5px', padding: '5px 10px' }}
        >
          首页
        </button>
      );
      
      // 上一页
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          style={{ margin: '0 5px', padding: '5px 10px' }}
        >
          上一页
        </button>
      );
    }
    
    // 显示当前页附近的页码
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{
            margin: '0 5px',
            padding: '5px 10px',
            backgroundColor: currentPage === i ? '#007bff' : 'white',
            color: currentPage === i ? 'white' : 'black',
            border: '1px solid #007bff',
            borderRadius: '3px'
          }}
        >
          {i}
        </button>
      );
    }
    
    if (currentPage < totalPages) {
      // 下一页
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          style={{ margin: '0 5px', padding: '5px 10px' }}
        >
          下一页
        </button>
      );
      
      // 总是显示最后一页
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          style={{ margin: '0 5px', padding: '5px 10px' }}
        >
          末页
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>产品清单</h2>
        <div>
          <label>每页显示数量：</label>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      
      {message && (
        <div style={{ marginBottom: '20px', color: message.includes('成功') ? 'green' : 'red' }}>
          {message}
        </div>
      )}
      
      {/* 购物车快捷入口 */}
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button
          onClick={() => navigate('/cart')}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          查看购物车
        </button>
      </div>
      
      {/* 产品列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '5px',
              padding: '15px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            {/* 产品图片 */}
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '100%', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  无图片
                </div>
              )}
            </div>
            
            {/* 产品信息 */}
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{product.name}</h3>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', height: '60px', overflow: 'hidden' }}>
              {product.description || '暂无描述'}
            </p>
            <div style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#dc3545', fontWeight: 'bold' }}>
              {formatPrice(product.price)}
            </div>
            
            {/* 操作按钮 */}
            <button
              onClick={() => handleAddToCart(product.id)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              添加到购物车
            </button>
          </div>
        ))}
      </div>
      
      {/* 分页控件 */}
      {totalPages > 1 && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>
            第 {currentPage} / {totalPages} 页，共 {products.length > 0 ? (totalPages - 1) * pageSize + products.length : 0} 条记录
          </div>
          <div>{renderPagination()}</div>
        </div>
      )}
    </div>
  );
};

export default ProductList;