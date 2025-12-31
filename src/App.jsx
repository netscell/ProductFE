import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CategoryManagement from './components/CategoryManagement';
import ProductAdd from './components/ProductAdd';
import ProductList from './components/ProductList';
import Cart from './components/Cart';

function App() {
  // 检查用户是否已登录
  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };

  // 受保护的路由组件
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn() ? children : <Navigate to="/login" />;
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        {/* 导航栏 */}
        <header style={{ backgroundColor: '#333', color: 'white', padding: '10px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px' }}>产品管理系统</h1>
            </div>
            <nav>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex' }}>
                {isLoggedIn() ? (
                  <>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>首页</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>产品清单</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/categories" style={{ color: 'white', textDecoration: 'none' }}>分类管理</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/products/add" style={{ color: 'white', textDecoration: 'none' }}>添加产品</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>购物车</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>退出登录</button>
                    </li>
                  </>
                ) : (
                  <>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>登录</Link>
                    </li>
                    <li style={{ margin: '0 10px' }}>
                      <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>注册</Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </header>

        {/* 主要内容 */}
        <main style={{ padding: '20px' }}>
          <Routes>
            {/* 公开路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 受保护路由 */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
            <Route path="/products/add" element={<ProtectedRoute><ProductAdd /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            
            {/* 默认路由 */}
            <Route path="*" element={<Navigate to={isLoggedIn() ? '/' : '/login'} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// 首页组件
const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h2>欢迎使用产品管理系统</h2>
      <p style={{ fontSize: '18px', color: '#666' }}>
        这是一个功能完整的产品管理系统，包含用户认证、商品分类管理和产品添加功能。
      </p>
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <Link to="/categories" style={{ padding: '15px 30px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          管理分类
        </Link>
        <Link to="/products/add" style={{ padding: '15px 30px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          添加产品
        </Link>
      </div>
    </div>
  );
};

export default App;