import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../api/cart';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 获取购物车内容
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error('获取购物车失败:', err);
      setMessage('获取购物车失败');
    }
  };

  // 更新商品数量
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, newQuantity);
      setMessage('数量更新成功');
      fetchCart();
      // 3秒后清除消息
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('数量更新失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 删除购物车商品
  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setMessage('商品已从购物车删除');
      fetchCart();
      // 3秒后清除消息
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('删除商品失败: ' + (err.response?.data?.message || err.message));
    }
  };

  // 清空购物车
  const handleClearCart = async () => {
    if (window.confirm('确定要清空购物车吗？')) {
      try {
        await clearCart();
        setMessage('购物车已清空');
        fetchCart();
        // 3秒后清除消息
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('清空购物车失败: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // 格式化价格
  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price);
  };

  // 计算总价
  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  // 继续购物
  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>购物车</h2>
      
      {message && (
        <div style={{ marginBottom: '20px', color: message.includes('成功') || message.includes('已从') || message.includes('已清空') ? 'green' : 'red' }}>
          {message}
        </div>
      )}
      
      {!cart || !cart.items || cart.items.length === 0 ? (
        // 购物车为空
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <h3>购物车是空的</h3>
          <p>快去添加一些商品吧！</p>
          <button
            onClick={handleContinueShopping}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            继续购物
          </button>
        </div>
      ) : (
        // 购物车有商品
        <div>
          {/* 购物车列表 */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>商品信息</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>单价</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>数量</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>小计</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => (
                <tr key={item.id}>
                  {/* 商品信息 */}
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          style={{ width: '80px', height: '80px', objectFit: 'contain', marginRight: '15px' }}
                        />
                      ) : (
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                          无图片
                        </div>
                      )}
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{item.product.name}</h4>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                          分类：{item.product.category?.name || '未分类'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* 单价 */}
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                    {formatPrice(item.product.price)}
                  </td>
                  
                  {/* 数量 */}
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '4px 0 0 4px',
                          border: '1px solid #ddd',
                          backgroundColor: item.quantity <= 1 ? '#f0f0f0' : 'white',
                          cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value);
                          if (!isNaN(newQuantity) && newQuantity > 0) {
                            handleQuantityChange(item.id, newQuantity);
                          }
                        }}
                        style={{
                          width: '60px',
                          height: '30px',
                          border: '1px solid #ddd',
                          borderLeft: 'none',
                          borderRight: 'none',
                          textAlign: 'center'
                        }}
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '0 4px 4px 0',
                          border: '1px solid #ddd',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  
                  {/* 小计 */}
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </td>
                  
                  {/* 操作 */}
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* 购物车底部操作 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
            {/* 左侧操作 */}
            <div>
              <button
                onClick={handleContinueShopping}
                style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '15px' }}
              >
                继续购物
              </button>
              <button
                onClick={handleClearCart}
                style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                清空购物车
              </button>
            </div>
            
            {/* 右侧金额汇总 */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '10px', fontSize: '18px' }}>
                <span>商品总价：</span>
                <span style={{ fontWeight: 'bold', fontSize: '24px', color: '#dc3545' }}>
                  {formatPrice(calculateTotal())}
                </span>
              </div>
              <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                共 {cart.items.reduce((total, item) => total + item.quantity, 0)} 件商品
              </div>
              <button
                onClick={() => alert('结算功能开发中...')}
                style={{ padding: '15px 40px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
              >
                去结算
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;