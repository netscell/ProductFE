import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../api/cart';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(id);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      setError('获取订单详情失败');
      console.error('获取订单详情失败:', err);
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

  if (!order) {
    return <div className="page-container">
      <div className="alert alert-error">订单不存在</div>
    </div>;
  }

  const statusInfo = getStatusColor(order.status);

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ margin: 0 }}>订单详情</h2>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/orders')}
              style={{ marginBottom: 0 }}
            >
              返回订单列表
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* 订单基本信息 */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-light)',
            borderRadius: 'var(--border-radius)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>订单号</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>#{order.id}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>订单状态</div>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    backgroundColor: statusInfo.color,
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  {statusInfo.text}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>下单时间</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatDate(order.createTime)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>订单总价</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>¥{order.totalPrice?.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>实付金额</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  ¥{order.actualPrice?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* 订单商品列表 */}
          <h3 style={{ marginBottom: '1rem' }}>订单商品</h3>
          {order.orderItems && order.orderItems.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>商品信息</th>
                    <th>SKU编码</th>
                    <th>单价</th>
                    <th>数量</th>
                    <th>小计</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {item.productImageUrls && item.productImageUrls.length > 0 && (
                            <img
                              src={`http://localhost:5192/api/file/view/${item.productImageUrls[0]}`}
                              alt={item.productName}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: 'var(--border-radius)',
                                border: '1px solid var(--border-color)'
                              }}
                            />
                          )}
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                              {item.productName}
                            </h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                              SKU编码: {item.skuCode || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {item.skuCode || 'N/A'}
                      </td>
                      <td>¥{item.unitPrice?.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 600 }}>¥{(item.unitPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-light)',
              borderRadius: 'var(--border-radius)'
            }}>
              <p style={{ color: 'var(--text-muted)' }}>订单商品为空</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
