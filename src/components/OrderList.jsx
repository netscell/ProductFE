import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../api/cart';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data || []);
      setError(null);
    } catch (err) {
      setError('获取订单列表失败');
      console.error('获取订单列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '待支付':
        return { color: '#ffc107', text: '待支付' };
      case '已支付':
        return { color: '#17a2b8', text: '已支付' };
      case '待发货':
        return { color: '#007bff', text: '待发货' };
      case '已发货':
        return { color: '#6c757d', text: '已发货' };
      case '已完成':
        return { color: '#28a745', text: '已完成' };
      case '已取消':
        return { color: '#dc3545', text: '已取消' };
      default:
        return { color: '#6c757d', text: status };
    }
  };

  if (loading) {
    return <div className="loading"><div className="loading-spinner"></div></div>;
  }

  if (error) {
    return <div className="page-container">
      <div className="alert alert-error">{error}</div>
    </div>;
  }

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">我的订单</h2>
        </div>
        <div className="card-body">
          {orders.length === 0 ? (
            <div className="empty-state">
              <h3>暂无订单</h3>
              <p>快去添加一些商品吧！</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>商品数量</th>
                    <th>总价</th>
                    <th>实付金额</th>
                    <th>订单状态</th>
                    <th>下单时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const statusInfo = getStatusColor(order.status);
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>#{order.id}</td>
                        <td>{order.quantity || 0}件</td>
                        <td>¥{order.totalPrice?.toFixed(2)}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                          ¥{order.actualPrice?.toFixed(2)}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              backgroundColor: statusInfo.color,
                              color: 'white',
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }}
                          >
                            {statusInfo.text}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {formatDate(order.createTime)}
                        </td>
                        <td>
                          <button
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.25rem 1rem' }}
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
