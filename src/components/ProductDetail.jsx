import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/product';
import { addToCart } from '../api/cart';
import { getProductReviews, addProductReview, updateReview, deleteReview, uploadImages } from '../api/comment';
import { addFootprint } from '../api/footprint';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, content: '', imageUrls: [] });
  const [newReviewImages, setNewReviewImages] = useState([]);
  const [newReviewImagePreviews, setNewReviewImagePreviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReview, setEditReview] = useState({ rating: 5, content: '', imageUrls: [] });
  const [editReviewImages, setEditReviewImages] = useState([]);
  const [editReviewImagePreviews, setEditReviewImagePreviews] = useState([]);

  // 获取产品详情
  useEffect(() => {
    fetchProductDetail();
    fetchReviews();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await getProduct(id);
      const specs = JSON.parse(response.data.specs);
      setProduct({ ...response.data, specs });
      console.log('产品详情specs:', response.data.specs);
      console.log('typeof spec:', typeof response.data.specs)

      // 添加足迹记录（使用第一个SKU）
      try {
        const firstSku = response.data.skus && response.data.skus.length > 0 ? response.data.skus[0] : null;
        if (firstSku) {
          await addFootprint(firstSku.id);
        }
      } catch (footprintErr) {
        console.error('添加足迹失败:', footprintErr);
      }

      setError(null);
    } catch (err) {
      setError('获取产品详情失败');
      console.error('获取产品详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取产品评论
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await getProductReviews(id);
      setReviews(response.data || []);
      setReviewsError(null);
    } catch (err) {
      setReviewsError('获取评论失败');
      console.error('获取评论失败:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // 提交评论
  const submitReview = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = newReview.imageUrls || [];

      // 如果有新图片，先上传
      if (newReviewImages.length > 0) {
        const uploadResponse = await uploadImages(newReviewImages);
        imageUrls = [...imageUrls, ...(uploadResponse.data.files || [])];
      }

      await addProductReview({
        productSkuId: parseInt(id),
        rating: newReview.rating,
        reviewText: newReview.content,
        imageUrls: imageUrls
      }, id);
      setMessage('评论提交成功');
      setNewReview({ rating: 5, content: '', imageUrls: [] });
      setNewReviewImages([]);
      setNewReviewImagePreviews([]);
      setShowReviewForm(false);
      fetchReviews(); // 重新加载评论列表
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('评论提交失败');
      console.error('评论提交失败:', err);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 开始编辑评论
  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditReview({
      rating: review.rating,
      content: review.content,
      imageUrls: review.imageUrls || []
    });
    setEditReviewImages([]);
    setEditReviewImagePreviews([]);
    setShowReviewForm(false);
  };

  // 取消编辑评论
  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditReview({ rating: 5, content: '', imageUrls: [] });
    setEditReviewImages([]);
    setEditReviewImagePreviews([]);
  };

  // 提交编辑评论
  const submitEditReview = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = editReview.imageUrls || [];

      // 如果有新图片，先上传
      if (editReviewImages.length > 0) {
        const uploadResponse = await uploadImages(editReviewImages);
        imageUrls = [...imageUrls, ...(uploadResponse.data || [])];
      }

      await updateReview(editingReviewId, {
        rating: editReview.rating,
        content: editReview.content,
        imageUrls: imageUrls
      });
      setMessage('评论修改成功');
      setEditingReviewId(null);
      setEditReview({ rating: 5, content: '', imageUrls: [] });
      setEditReviewImages([]);
      setEditReviewImagePreviews([]);
      fetchReviews(); // 重新加载评论列表
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('评论修改失败');
      console.error('评论修改失败:', err);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 删除评论
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }
    try {
      await deleteReview(reviewId);
      setMessage('评论删除成功');
      fetchReviews(); // 重新加载评论列表
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('评论删除失败');
      console.error('评论删除失败:', err);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 处理新评论图片选择
  const handleNewReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewReviewImages(prev => [...prev, ...files]);

      // 创建预览
      files.forEach(file => {
        const preview = URL.createObjectURL(file);
        setNewReviewImagePreviews(prev => [...prev, preview]);
      });
    }
  };

  // 删除新评论图片
  const removeNewReviewImage = (index) => {
    setNewReviewImages(prev => prev.filter((_, i) => i !== index));
    setNewReviewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // 删除已上传的新评论图片URL
  const removeNewReviewImageUrl = (index) => {
    setNewReview(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  // 处理编辑评论图片选择
  const handleEditReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditReviewImages(prev => [...prev, ...files]);

      // 创建预览
      files.forEach(file => {
        const preview = URL.createObjectURL(file);
        setEditReviewImagePreviews(prev => [...prev, preview]);
      });
    }
  };

  // 删除编辑评论的新图片
  const removeEditReviewImage = (index) => {
    setEditReviewImages(prev => prev.filter((_, i) => i !== index));
    setEditReviewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // 删除编辑评论已上传的图片URL
  const removeEditReviewImageUrl = (index) => {
    setEditReview(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  // 切换图片
  const handlePrevImage = () => {
    if (product?.imageUrls?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.imageUrls.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product?.imageUrls?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === product.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  // 选择缩略图
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  // 处理数量变化
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= (product?.quantityInStock || 99)) {
      setQuantity(value);
    }
  };

  // 增加数量
  const handleIncreaseQuantity = () => {
    if (quantity < (product?.quantityInStock || 99)) {
      setQuantity(prev => prev + 1);
    }
  };

  // 减少数量
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // 添加到购物车
  const handleAddToCart = async () => {
    try {
      await addToCart({
        productSkuId: product.id,
        quantity: 1
      });
      setMessage('已添加到购物车');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('添加到购物车失败');
      console.error('添加到购物车失败:', err);
    }
  };

  // 获取价格
  const getDisplayPrice = () => {
    if (!product) return '0.00';

    // 检查是否有活动促销
    const now = new Date();
    const activePromotion = product.promotions?.find(promo => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      return now >= startDate && now <= endDate;
    });

    if (activePromotion) {
      const discount = activePromotion.discountPercent || 0;
      const discountedPrice = product.unitPrice * (1 - discount / 100);
      return {
        original: product.unitPrice,
        current: discountedPrice,
        discount: discount,
        hasDiscount: true
      };
    }

    return {
      original: product.unitPrice,
      current: product.unitPrice,
      hasDiscount: false
    };
  };

  if (loading) {
    return <div className="loading"><div className="loading-spinner"></div></div>;
  }

  if (error) {
    return <div className="page-container">
      <div className="alert alert-error">{error}</div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        返回
      </button>
    </div>;
  }

  if (!product) {
    return <div className="page-container">
      <div className="alert alert-error">产品不存在</div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        返回
      </button>
    </div>;
  }

  const priceInfo = getDisplayPrice();
  const hasImages = product.imageUrls && product.imageUrls.length > 0;

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            style={{ marginRight: '1rem' }}
          >
            ← 返回
          </button>
          <h2 className="card-title">产品详情</h2>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* 左侧：图片展示 */}
            <div>
              {/* 主图片 */}
              <div style={{
                position: 'relative',
                marginBottom: '1rem',
                borderRadius: 'var(--border-radius)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-light)',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {hasImages ? (
                  <img
                    src={`http://localhost:5192/api/file/view/${product.imageUrls[currentImageIndex]}`}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      maxWidth: '100%',
                      maxHeight: '500px'
                    }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>暂无图片</div>
                )}

                {/* 图片切换按钮 */}
                {hasImages && product.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={handleNextImage}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* 缩略图列表 */}
              {hasImages && product.imageUrls.length > 1 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '10px'
                }}>
                  {product.imageUrls.map((imageUrl, index) => (
                    <div
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        border: currentImageIndex === index ? '3px solid var(--primary-color)' : '2px solid transparent',
                        borderRadius: 'var(--border-radius)',
                        overflow: 'hidden',
                        aspectRatio: '1'
                      }}
                    >
                      <img
                        src={`http://localhost:5192/api/file/view/${imageUrl}`}
                        alt={`缩略图 ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：产品信息 */}
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>
                {product.name}
              </h1>

              {/* 价格信息 */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-light)', borderRadius: 'var(--border-radius)' }}>
                {priceInfo.hasDiscount ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                        ¥{priceInfo.current.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        ¥{priceInfo.original.toFixed(2)}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--color-danger)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        -{priceInfo.discount}%
                      </span>
                    </div>
                    <div style={{ marginTop: '0.5rem', color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                      促销活动中
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                    ¥{priceInfo.current.toFixed(2)}
                  </span>
                )}
              </div>

              {/* 库存信息 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>库存： </span>
                <span style={{ fontWeight: 600, color: product.quantityInStock > 0 ? 'var(--success-color)' : 'var(--color-danger)' }}>
                  {product.quantityInStock > 0 ? `${product.quantityInStock} 件` : '缺货'}
                </span>
              </div>

              {/* 分类信息 */}
              {product.specificationIds && product.specificationIds.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>规格： </span>
                  <span style={{ fontWeight: 600 }}>
                    {product.specificationIds.join(', ')}
                  </span>
                </div>
              )}

              {/* 促销信息 */}
              {product.promotions && product.promotions.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem'}}>促销活动：</div>
                  {product.promotions.map((promo, index) => (
                    <div key={index} style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'var(--color-light)',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ fontWeight: 600 }}>{promo.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{promo.description}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {new Date(promo.startDate).toLocaleString()} - {new Date(promo.endDate).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 购买数量 */}
              {product.quantityInStock > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>购买数量：</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--color-light)',
                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantityInStock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      style={{
                        width: '80px',
                        height: '40px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                    <button
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= product.quantityInStock}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--color-light)',
                        cursor: quantity >= product.quantityInStock ? 'not-allowed' : 'pointer',
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantityInStock === 0}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
                >
                  {product.quantityInStock === 0 ? '缺货' : '加入购物车'}
                </button>
              </div>
            </div>
          </div>

          {/* 标签页 */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveTab('details')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderBottom: activeTab === 'details' ? '3px solid var(--primary-color)' : 'none',
                  marginBottom: activeTab === 'details' ? '-2px' : '0',
                  color: activeTab === 'details' ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                产品描述
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderBottom: activeTab === 'specifications' ? '3px solid var(--primary-color)' : 'none',
                  marginBottom: activeTab === 'specifications' ? '-2px' : '0',
                  color: activeTab === 'specifications' ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                规格明细
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderBottom: activeTab === 'reviews' ? '3px solid var(--primary-color)' : 'none',
                  marginBottom: activeTab === 'reviews' ? '-2px' : '0',
                  color: activeTab === 'reviews' ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                用户评论
              </button>
            </div>

            {/* 标签页内容 */}
            <div style={{ padding: '2rem 0' }}>
              {activeTab === 'details' && (
                <div>
                  <h3 style={{ marginBottom: '1rem' }}>产品描述</h3>
                  <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    {product.description || '暂无产品描述'}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 style={{ marginBottom: '1rem' }}>规格明细</h3>

                  {/* 规格明细列表 */}
                  {product.specs && product.specs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {product.specs.map((spec, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--color-light)',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {/* 分类 */}
                          <h4 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            color: 'var(--primary-color)',
                              borderBottom: '2px solid var(--primary-color)',
                              paddingBottom: '0.5rem'
                          }}>
                            {spec.category}
                          </h4>

                          {/* 特性列表 */}
                          {spec.features && spec.features.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {spec.features.map((feature, featureIndex) => (
                                <div
                                  key={featureIndex}
                                  style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--border-radius)',
                                    borderLeft: '4px solid var(--primary-color)'
                                  }}
                                >
                                  {/* 特性 */}
                                  <div style={{
                                    fontWeight: 600,
                                    marginBottom: '0.25rem',
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.6'
                                  }}>
                                    {feature.feature}
                                  </div>

                                  {/* 值 */}
                                  <div style={{
                                    marginBottom: '0.25rem',
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.6'
                                  }}>
                                    {feature.value}
                                  </div>

                                  {/* 备注 */}
                                  {feature.remark && (
                                    <div style={{
                                      fontSize: '0.9rem',
                                      color: 'var(--text-muted)',
                                      fontStyle: 'italic',
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word',
                                      lineHeight: '1.6'
                                    }}>
                                      {feature.remark}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ color: 'var(--text-muted)' }}>暂无特性信息</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-light)',
                      borderRadius: 'var(--border-radius)'
                    }}>
                      <p style={{ color: 'var(--text-muted)' }}>暂无规格明细</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>用户评论 ({reviews.length})</h3>
                    {!editingReviewId && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        {showReviewForm ? '取消评论' : '写评论'}
                      </button>
                    )}
                  </div>

                  {/* 新增评论表单 */}
                  {showReviewForm && !editingReviewId && (
                    <div style={{
                      padding: '1.5rem',
                      backgroundColor: 'var(--color-light)',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '2rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <h4 style={{ marginBottom: '1rem' }}>发表评论</h4>
                      <form onSubmit={submitReview}>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>评分：</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                style={{
                                  fontSize: '2rem',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: star <= newReview.rating ? '#ffc107' : '#e0e0e0',
                                  padding: 0
                                }}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>评论内容：</label>
                          <textarea
                            value={newReview.content}
                            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                            required
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--border-radius)',
                              fontSize: '1rem',
                              resize: 'vertical'
                            }}
                            placeholder="请输入您的评论..."
                          />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>上传图片（可选）：</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleNewReviewImageChange}
                            style={{ marginBottom: '0.5rem' }}
                          />
                          {/* 图片预览 */}
                          {(newReviewImagePreviews.length > 0 || newReview.imageUrls.length > 0) && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {newReview.imageUrls.map((url, index) => (
                                <div
                                  key={`url-${index}`}
                                  style={{
                                    position: 'relative',
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: 'var(--border-radius)',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-color)'
                                  }}
                                >
                                  <img
                                    src={`http://localhost:5192/api/file/view/${url}`}
                                    alt={`预览 ${index + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeNewReviewImageUrl(index)}
                                    style={{
                                      position: 'absolute',
                                      top: '2px',
                                      right: '2px',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                      color: 'white',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              {newReviewImagePreviews.map((preview, index) => (
                                <div
                                  key={`preview-${index}`}
                                  style={{
                                    position: 'relative',
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: 'var(--border-radius)',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-color)'
                                  }}
                                >
                                  <img
                                    src={preview}
                                    alt={`预览 ${index + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeNewReviewImage(index)}
                                    style={{
                                      position: 'absolute',
                                      top: '2px',
                                      right: '2px',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                      color: 'white',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="submit" className="btn btn-primary">
                            提交评论
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowReviewForm(false)}
                          >
                            取消
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* 评论列表 */}
                  {reviewsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div className="loading-spinner"></div>
                    </div>
                  ) : reviewsError ? (
                    <div className="alert alert-error">{reviewsError}</div>
                  ) : reviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--color-light)',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {/* 编辑评论表单 */}
                          {editingReviewId === review.id ? (
                            <div>
                              <h4 style={{ marginBottom: '1rem' }}>编辑评论</h4>
                              <form onSubmit={submitEditReview}>
                                <div style={{ marginBottom: '1rem' }}>
                                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>评分：</label>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditReview({ ...editReview, rating: star })}
                                        style={{
                                          fontSize: '2rem',
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: star <= editReview.rating ? '#ffc107' : '#e0e0e0',
                                          padding: 0
                                        }}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>评论内容：</label>
                                  <textarea
                                    value={editReview.content}
                                    onChange={(e) => setEditReview({ ...editReview, content: e.target.value })}
                                    required
                                    rows={4}
                                    style={{
                                      width: '100%',
                                      padding: '0.75rem',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: 'var(--border-radius)',
                                      fontSize: '1rem',
                                      resize: 'vertical'
                                    }}
                                    placeholder="请输入您的评论..."
                                  />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>上传图片（可选）：</label>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleEditReviewImageChange}
                                    style={{ marginBottom: '0.5rem' }}
                                  />
                                  {/* 图片预览 */}
                                  {(editReviewImagePreviews.length > 0 || editReview.imageUrls.length > 0) && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                      {editReview.imageUrls.map((url, index) => (
                                        <div
                                          key={`url-${index}`}
                                          style={{
                                            position: 'relative',
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: 'var(--border-radius)',
                                            overflow: 'hidden',
                                            border: '1px solid var(--border-color)'
                                          }}
                                        >
                                          <img
                                            src={`http://localhost:5192/api/file/view/${url}`}
                                            alt={`预览 ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeEditReviewImageUrl(index)}
                                            style={{
                                              position: 'absolute',
                                              top: '2px',
                                              right: '2px',
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                              color: 'white',
                                              border: 'none',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                      {editReviewImagePreviews.map((preview, index) => (
                                        <div
                                          key={`preview-${index}`}
                                          style={{
                                            position: 'relative',
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: 'var(--border-radius)',
                                            overflow: 'hidden',
                                            border: '1px solid var(--border-color)'
                                          }}
                                        >
                                          <img
                                            src={preview}
                                            alt={`预览 ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeEditReviewImage(index)}
                                            style={{
                                              position: 'absolute',
                                              top: '2px',
                                              right: '2px',
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                              color: 'white',
                                              border: 'none',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button type="submit" className="btn btn-primary">
                                    保存修改
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancelEditReview}
                                  >
                                    取消
                                  </button>
                                </div>
                              </form>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                      {review.userName || '匿名用户'}
                                    </span>
                                    <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>
                                      {'★'.repeat(review.rating)}
                                      {'☆'.repeat(5 - review.rating)}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {review.createTime ? new Date(review.createTime).toLocaleString('zh-CN') : ''}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                                  >
                                    编辑
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="btn"
                                    style={{
                                      padding: '0.25rem 0.75rem',
                                      fontSize: '0.85rem',
                                      backgroundColor: 'var(--color-danger)',
                                      color: 'white',
                                      border: 'none'
                                    }}
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                              <p style={{
                                lineHeight: '1.8',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}>
                                {review.content}
                              </p>
                              {/* 显示评论图片 */}
                              {review.imageUrls && review.imageUrls.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                  {review.imageUrls.map((url, index) => (
                                    <img
                                      key={index}
                                      src={`http://localhost:5192/api/file/view/${url}`}
                                      alt={`评论图片 ${index + 1}`}
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--border-radius)',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(`http://localhost:5192/api/file/view/${url}`, '_blank')}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-light)',
                      borderRadius: 'var(--border-radius)'
                    }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>暂无用户评论</p>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowReviewForm(true)}
                      >
                        成为第一个评论者
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
