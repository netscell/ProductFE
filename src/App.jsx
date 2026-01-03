import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CategoryManagement from './components/CategoryManagement';
import ProductAdd from './components/ProductAdd';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import ProductManagement from './components/ProductManagement';

// 受保护路由组件
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 使用axiosInstance验证token有效性
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return <div className="loading"><div className="loading-spinner"></div></div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 导航栏组件
// 导入促销组件
import PromotionTypeManagement from './components/PromotionTypeManagement';
import PromotionManagement from './components/PromotionManagement';

// 在导航栏中添加促销相关链接
const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">产品管理系统</Link>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <ul className="nav-list">
                <li>
                  <Link
                    to="/"
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  >
                    首页
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}
                  >
                    分类管理
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                  >
                    产品清单
                  </Link>
                </li>
                <li>
                  <Link
                    to="/add-product"
                    className={`nav-link ${location.pathname === '/add-product' ? 'active' : ''}`}
                  >
                    添加产品
                  </Link>
                </li>
                <li>
                  <Link
                    to="/product-management"
                    className={`nav-link ${location.pathname === '/product-management' ? 'active' : ''}`}
                  >
                    产品管理
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
                  >
                    购物车
                  </Link>
                </li>
                <li>
                  <Link
                    to="/promotion-types"
                    className={`nav-link ${location.pathname === '/promotion-types' ? 'active' : ''}`}
                  >
                    促销类型管理
                  </Link>
                </li>
                <li>
                  <Link
                    to="/promotions"
                    className={`nav-link ${location.pathname === '/promotions' ? 'active' : ''}`}
                  >
                    促销管理
                  </Link>
                </li>
              </ul>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">退出登录</button>
            </>
          ) : (
            <ul className="nav-list">
              <li>
                <Link
                  to="/login"
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  登录
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                >
                  注册
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
};

// 首页组件
const Home = () => {
  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">欢迎使用产品管理系统</h1>
        </div>
        <div className="card-body">
          <p>这是一个功能完整的产品管理系统，包括用户认证、分类管理、产品管理和购物车功能。</p>
          <p>请使用导航栏访问各个功能模块。</p>
        </div>
      </div>
    </div>
  );
};

// 在Routes中添加促销相关路由
function App() {
  return (
    <Router>
      <Navigation />
      <div className="page-container">
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 受保护路由 */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
          <Route path="/add-product" element={<ProtectedRoute><ProductAdd /></ProtectedRoute>} />
          <Route path="/product-management" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/promotion-types" element={<ProtectedRoute><PromotionTypeManagement /></ProtectedRoute>} />
          <Route path="/promotions" element={<ProtectedRoute><PromotionManagement /></ProtectedRoute>} />
          
          {/* 404路由 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;