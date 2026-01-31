import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    {
      id: 'product',
      title: '产品管理',
      icon: '📦',
      children: [
        { path: '/admin/product-management', label: '产品管理' },
        { path: '/admin/add-product', label: '添加产品' },
        { path: '/admin/product-families', label: '产品家族管理' }
      ]
    },
    {
      id: 'category',
      title: '分类管理',
      icon: '📁',
      children: [
        { path: '/admin/categories', label: '分类管理' }
      ]
    },
    {
      id: 'promotion',
      title: '促销管理',
      icon: '🏷️',
      children: [
        { path: '/admin/promotions', label: '促销管理' },
        { path: '/admin/promotion-types', label: '促销类型管理' }
      ]
    }
  ];

  return (
    <div className="admin-layout">
      {/* 左侧树形菜单 */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-logo">管理后台</h2>
        </div>
        <nav className="admin-nav">
          <ul className="admin-menu">
            {menuItems.map(menu => (
              <li key={menu.id} className="admin-menu-item">
                <button
                  className="admin-menu-toggle"
                  onClick={() => toggleMenu(menu.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{menu.icon}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{menu.title}</span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    transition: 'transform 0.3s',
                    transform: expandedMenus[menu.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                </button>
                {expandedMenus[menu.id] && menu.children && (
                  <ul className="admin-submenu">
                    {menu.children.map(child => (
                      <li key={child.path}>
                        <Link
                          to={child.path}
                          className={`admin-submenu-link ${location.pathname === child.path ? 'active' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 右侧内容区域 */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
