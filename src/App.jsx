import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CategoryManagement from './components/CategoryManagement';
import ProductAdd from './components/ProductAdd';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import ProductManagement from './components/ProductManagement';
import ProductDetail from './components/ProductDetail';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import AdminLayout from './components/AdminLayout';
import UserNavigation from './components/UserNavigation';
import PromotionTypeManagement from './components/PromotionTypeManagement';
import PromotionManagement from './components/PromotionManagement';
import Footprint from './components/Footprint';
import ProductFamily from './components/ProductFamily';
import ProductCompare from './components/ProductCompare';

// 受保护路由组件
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return <div className="loading"><div className="loading-spinner"></div></div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 管理后台路由
const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="product-management" replace />} />
      <Route path="product-management" element={<AdminLayout><ProductManagement /></AdminLayout>} />
      <Route path="add-product" element={<AdminLayout><ProductAdd /></AdminLayout>} />
      <Route path="product-families" element={<AdminLayout><ProductFamily /></AdminLayout>} />
      <Route path="categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
      <Route path="promotions" element={<AdminLayout><PromotionManagement /></AdminLayout>} />
      <Route path="promotion-types" element={<AdminLayout><PromotionTypeManagement /></AdminLayout>} />
    </Routes>
  );
};

// 用户界面路由
const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserNavigation><ProductList /></UserNavigation>} />
      <Route path="/products" element={<UserNavigation><ProductList /></UserNavigation>} />
      <Route path="/product/:id" element={<UserNavigation><ProductDetail /></UserNavigation>} />
      <Route path="/compare/:id?" element={<UserNavigation><ProductCompare /></UserNavigation>} />
      <Route path="/footprints" element={<UserNavigation><Footprint /></UserNavigation>} />
      <Route path="/cart" element={<UserNavigation><Cart /></UserNavigation>} />
      <Route path="/orders" element={<UserNavigation><OrderList /></UserNavigation>} />
      <Route path="/order/:id" element={<UserNavigation><OrderDetail /></UserNavigation>} />
    </Routes>
  );
};

// 主应用组件
function App() {
  return (
    <Router>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 管理后台路由 */}
        <Route path="/admin/*" element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />

        {/* 用户界面路由 */}
        <Route path="/*" element={<ProtectedRoute><UserRoutes /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
