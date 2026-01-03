import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../api/product';
import { addToCart } from '../api/cart';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize]);

  // ProductList.jsx中的fetchProducts
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts({
        page: currentPage,
        size: pageSize
      });
      console.log('获取产品列表成功:', JSON.stringify(response.data));
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

  const handleAddToCart = async (product) => {
    try {
      await addToCart({
        productId: product.id,
        quantity: 1
      });
      alert('添加到购物车成功');
    } catch (err) {
      alert('添加到购物车失败，请稍后重试');
      console.error('添加到购物车失败:', err);
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
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
          <h2 className="card-title">产品清单</h2>
        </div>
        <div className="card-body">
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
                    <img 
                      src={`http://localhost:5192/api/file/view/${product.imageUrls?.[0] }`} 
                      alt={product.name} 
                      className="img-responsive img-preview mb-3"
                      style={{ height: '150px', objectFit: 'cover', borderRadius: 'var(--border-radius)' }}
                    />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>
                      {product.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
                      {product.description?.substring(0, 50)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        ¥{product.price.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {product.category?.name || '未分类'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-primary w-full"
                    >
                      添加到购物车
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
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
    </div>
  );
};

export default ProductList;