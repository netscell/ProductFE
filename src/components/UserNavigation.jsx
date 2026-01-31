import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './UserNavigation.css';

const UserNavigation = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  useEffect(() => {
    // 获取购物车商品数量
    const updateCartCount = () => {
      // 暂时固定为0，后续可以从API获取
      setCartItemCount(0);
    };

    updateCartCount();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const userMenuItems = [
    { path: '/', label: '产品清单', icon: '🏠' },
    { path: '/footprints', label: '我的足迹', icon: '👣' },
    { path: '/cart', label: '购物车', icon: '🛒', badge: cartItemCount },
    { path: '/orders', label: '我的订单', icon: '📋' },
    { path: '/admin', label: '管理后台', icon: '⚙️', external: true }
  ];

  return (
    <div className="user-layout">
      {/* 顶部导航栏 */}
      <header className="user-header">
        <div className="user-header-content">
          <div className="user-logo-section">
            <Link to="/" className="user-logo">
              <span className="logo-icon">🛍️</span>
              <span className="logo-text">商城系统</span>
            </Link>
          </div>

          <nav className="user-nav">
            {isAuthenticated ? (
              <>
                {userMenuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`user-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </Link>
                ))}
                <button onClick={handleLogout} className="user-nav-link logout-btn">
                  <span className="nav-icon">🚪</span>
                  <span className="nav-label">退出登录</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`user-nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  <span className="nav-icon">👤</span>
                  <span className="nav-label">登录</span>
                </Link>
                <Link
                  to="/register"
                  className={`user-nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                >
                  <span className="nav-icon">📝</span>
                  <span className="nav-label">注册</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="user-content">
        {children}
      </main>

      {/* 底部 */}
      <footer className="user-footer">
        <div className="footer-content">
          <p>© 2026 商城系统 - 版权所有</p>
        </div>
      </footer>
    </div>
  );
};

export default UserNavigation;
