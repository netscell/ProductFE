import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, deleteCartItem, clearCart } from '../api/cart';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  // Cart.jsx中的fetchCart
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      setCartItems(response.data);
      console.log("购物车内容:", response.data);
      setError(null);
    } catch (err) {
      setError('获取购物车失败，请稍后重试');
      console.error('获取购物车失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, quantity);
      fetchCart();
    } catch (err) {
      alert('更新数量失败，请稍后重试');
      console.error('更新数量失败:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteCartItem(itemId);
      fetchCart();
    } catch (err) {
      alert('删除商品失败，请稍后重试');
      console.error('删除商品失败:', err);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('确定要清空购物车吗？')) {
      try {
        await clearCart();
        fetchCart();
      } catch (err) {
        alert('清空购物车失败，请稍后重试');
        console.error('清空购物车失败:', err);
      }
    }
  };

  const calculateTotal = () => {
    /**
 * 计算购物车中商品项的总价
 * @param {number} total - 当前累计总价
 * @param {Object} item - 购物车中的商品项
 * @param {Object} item.product - 商品信息
 * @param {number} item.product.price - 商品单价
 * @param {number} item.quantity - 商品数量
 * @returns {number} 更新后的累计总价
 */
return cartItems.items?.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h2 className="card-title">购物车</h2>
            {cartItems.items?.length > 0 && (
              <button onClick={() => handleClearCart()} className="btn btn-danger btn-sm">
                清空购物车
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {cartItems.items?.length === 0 ? (
            <div className="empty-state">
              <h3>购物车是空的</h3>
              <p>快去添加一些商品吧！</p>
            </div>
          ) : (
            <div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>商品信息</th>
                      <th>单价</th>
                      <th>数量</th>
                      <th>小计</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.items?.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <img 
                            src={`http://localhost:5192/api/file/view/${item.images[0]}`}                               
                              alt={item.productName} 
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--border-radius)' }}
                            />
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                {item.productName}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {item.description?.substring(0, 30)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>¥{item.unitPrice.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', minWidth: '30px' }}
                            >
                              -
                            </button>
                            <span style={{ width: '40px', textAlign: 'center' }}>{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', minWidth: '30px' }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>¥{(item.unitPrice * item.quantity).toFixed(2)}</td>
                        <td>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="btn btn-danger btn-sm"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
                <div style={{ width: '300px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>总计：</span>
                    <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-color)' }}>
                      ¥{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <button className="btn btn-primary w-full btn-lg">
                      去结算
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;