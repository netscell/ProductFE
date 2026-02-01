import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductSku, getProductsByCategory, getProduct} from '../api/product';
import { getProductFamiliesByCategory } from '../api/productFamily';
import './ProductCompare.css';

const ProductCompare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productModalList, setProductModalList] = useState([]);
  const [productModalLoading, setProductModalLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // 从路由参数获取初始产品ID，清除之前的对比列表
      localStorage.removeItem('compareList');
      addProductToCompare(id);
    } else {
      // 从localStorage读取对比列表
      const saved = localStorage.getItem('compareList');
      if (saved) {
        const products = JSON.parse(saved);
        setCompareList(products);
      }
      setLoading(false);
    }
  }, [id]);

  const loadCompareProducts = async (productIds) => {
    try {
      setLoading(true);
      const promises = productIds.map(pid => getProductSku(pid));
      const responses = await Promise.all(promises);
      const products = responses.map(r => r.data);
      setCompareList(products);
      localStorage.setItem('compareList', JSON.stringify(products));
    } catch (error) {
      console.error('加载对比产品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProductToCompare = async (productId) => {
    try {
      setLoading(true);
      // 获取产品详情
      const response = await getProductSku(productId);
      const newProduct = response.data;

      const srcProduct = await getProduct(newProduct.productId);
      console.log("srcProduct spec:", srcProduct.data.specs);

      // 确保specs是解析后的对象
      let productData = { ...srcProduct.data };
      if (typeof productData.specs === 'string') {
        try {
          productData.specs = JSON.parse(productData.specs);
        } catch (e) {
          console.error('解析specs失败:', e);
          productData.specs = [];
        }
      }

      // 获取当前对比列表
      const saved = localStorage.getItem('compareList');
      const currentList = saved ? JSON.parse(saved) : [];
      console.log('currentList:', currentList);

      // 检查是否已存在
      const exists = currentList.some(p => p.id === productData.id);
      if (exists) {
        // 如果已存在，直接加载当前列表
        setCompareList(currentList);
        return;
      }

      productData.subCategoryId = newProduct.subCategoryId;

      // 添加新产品到列表（最多5个）
      const updatedList = [...currentList, productData].slice(0, 5);
      setCompareList(updatedList);
      localStorage.setItem('compareList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('添加对比产品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeProductFromCompare = (productId) => {
    const updatedList = compareList.filter(p => p.id !== productId);
    setCompareList(updatedList);
    localStorage.setItem('compareList', JSON.stringify(updatedList));
  };

  const clearCompareList = () => {
    setCompareList([]);
    localStorage.removeItem('compareList');
  };

  // 打开添加产品对话框
  const openProductModal = async () => {
    if (compareList.length === 0) {
      alert('请先添加至少一个产品');
      return;
    }

    setShowProductModal(true);
    setProductModalLoading(true);
    setProductModalList([]);

    try {
      // 获取第一个产品的二级分类ID
      const firstProduct = compareList[0];
      //console.log('firstProduct:', JSON.stringify(firstProduct));
      let categoryId = firstProduct.subCategoryId;
      console.log('categoryId:', categoryId);

      // 尝试从产品对象获取分类ID
      //if ( && firstProduct.categoryIds.length > 0) {
        // 如果产品有多个分类，使用最后一个（可能是二级分类）
      //  categoryId = firstProduct.categoryIds[firstProduct.categoryIds.length - 1];
      // }

      if (!categoryId) {
        setProductModalLoading(false);
        alert('无法确定产品分类');
        return;
      }

      // 根据分类ID获取产品列表
      const response = await getProductFamiliesByCategory(categoryId);
      const allProducts = response.data || [];
      console.log('allProducts:', JSON.stringify(allProducts));

      // 按产品族分组产品
   /*   const groupedProducts = {};
      allProducts.forEach(product => {
        const familyId = product.id || 'default';
        if (!groupedProducts[familyId]) {
          groupedProducts[familyId] = {
            id: familyId,
            name: product.name || '默认产品族',
            products: []
          };
        }
        groupedProducts[familyId].products.push(product);
      });
      */

      setProductModalList(allProducts); // Object.values(groupedProducts)
    } catch (error) {
      console.error('获取产品列表失败:', error);
      alert('获取产品列表失败');
    } finally {
      setProductModalLoading(false);
    }
  };

  // 从对话框添加产品到对比
  const addProductFromModal = async (product) => {
    // 检查是否已存在
    if (compareList.some(p => p.id === product.id)) {
      alert('该产品已在对比列表中');
      return;
    }

    const srcProduct = await getProduct(product.id);

    // 确保specs是解析后的对象
    let productData = { ...srcProduct.data };
    if (typeof productData.specs === 'string') {
      try {
        productData.specs = JSON.parse(productData.specs);
      } catch (e) {
        console.error('解析specs失败:', e);
        productData.specs = [];
      }
    }

    // 添加到对比列表（最多5个）
    const updatedList = [...compareList, productData].slice(0, 5);
    setCompareList(updatedList);
    localStorage.setItem('compareList', JSON.stringify(updatedList));

    // 关闭对话框
    setShowProductModal(false);
  };

  // 获取所有规格（按category分组）
  const getAllSpecs = () => {
    const categoryMap = {};

    compareList.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach(category => {
          const categoryName = category.category;
          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = new Set();
          }
          if (category.features && Array.isArray(category.features)) {
            category.features.forEach(feature => {
              categoryMap[categoryName].add(feature.feature);
            });
          }
        });
      }
    });

    // 转换为数组格式
    return Object.entries(categoryMap).map(([category, features]) => ({
      category,
      features: Array.from(features)
    }));
  };

  // 获取规格值
  const getSpecValue = (product, categoryName, featureName) => {
    if (!product.specs || !Array.isArray(product.specs)) return '-';

    const category = product.specs.find(c => c.category === categoryName);
    if (!category || !category.features || !Array.isArray(category.features)) return '-';

    const feature = category.features.find(f => f.feature === featureName);
    return feature ? (feature.value || '-') : '-';
  };

  // 获取产品价格
  const getPriceRange = (product) => {
    if (product.startingPrice !== null && product.startingPrice !== undefined) {
      return `¥${product.startingPrice.toFixed(2)}`;
    }
    return '-';
  };

  // 去产品详情页
  const goToProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="compare-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (compareList.length === 0) {
    return (
      <div className="compare-empty">
        <div className="empty-icon">📊</div>
        <h2>产品对比</h2>
        <p>请选择产品进行对比</p>
      </div>
    );
  }

  const allSpecs = getAllSpecs();

  return (
    <div className="compare-container">
      <div className="compare-header">
        <h1>产品对比</h1>
        <div className="header-actions">
          {compareList.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={openProductModal}>
                添加产品
              </button>
              <button className="btn btn-danger" onClick={clearCompareList}>
                清空对比
              </button>
            </>
          )}
          {compareList.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              返回首页
            </button>
          )}
        </div>
      </div>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="spec-column">对比项目</th>
              {compareList.map(product => (
                <th key={product.id} className="product-column">
                  <div className="product-header">
                    <img
                      src={product.image || `http://localhost:5192/api/file/view/${product.ImageUrl}`}
                      alt={product.name}
                      className="product-image"
                      onClick={() => goToProductDetail(product.id)}
                    />
                    <h3 onClick={() => goToProductDetail(product.id)}>{product.name}</h3>
                    <button
                      className="remove-btn"
                      onClick={() => removeProductFromCompare(product.id)}
                      title="移除此产品"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 价格对比 */}
            <tr className="compare-row">
              <td className="spec-label">价格</td>
              {compareList.map(product => (
                <td key={product.id} className="spec-value price-value">
                  {getPriceRange(product)}
                </td>
              ))}
            </tr>

            {/* 规格对比 - 按category分组 */}
            {allSpecs.map(specCategory => (
              <React.Fragment key={specCategory.category}>
                <tr className="compare-row category-header-row">
                  <td className="spec-label category-label">{specCategory.category}</td>
                  {compareList.map(product => (
                    <td key={product.id} className="spec-value"></td>
                  ))}
                </tr>
                {specCategory.features.map(featureName => (
                  <tr key={`${specCategory.category}-${featureName}`} className="compare-row">
                    <td className="spec-label feature-label">{featureName}</td>
                    {compareList.map(product => (
                      <td key={`${product.id}-${specCategory.category}-${featureName}`} className="spec-value">
                        {getSpecValue(product, specCategory.category, featureName)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* 描述对比 */}
            <tr className="compare-row">
              <td className="spec-label">描述</td>
              {compareList.map(product => (
                <td key={product.id} className="spec-value description">
                  {product.description || '-'}
                </td>
              ))}
            </tr>

            {/* 操作 */}
            <tr className="compare-row action-row">
              <td className="spec-label">操作</td>
              {compareList.map(product => (
                <td key={product.id} className="spec-value">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => goToProductDetail(product.id)}
                  >
                    查看详情
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 产品选择对话框 */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">选择产品</h2>
              <button
                className="modal-close"
                onClick={() => setShowProductModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {productModalLoading ? (
                <div className="modal-loading">
                  <div className="loading-spinner"></div>
                  <p>加载中...</p>
                </div>
              ) : (
                <>
                  {productModalList.length === 0 ? (
                    <div className="modal-empty">
                      <p>该分类下暂无产品</p>
                    </div>
                  ) : (
                    <div className="product-family-container">
                      {productModalList.map(family => (
                        <div key={family.id} className="product-family-group">
                          <h3 className="family-title">{family.name}</h3>
                          <div className="product-grid">
                            {family.products.map(product => (
                              <div
                                key={product.id}
                                className="product-card"
                                onClick={() => addProductFromModal(product)}
                              >
                                <img
                                  src={product.image || `http://localhost:5192/api/file/view/${product.imageUrl}`}
                                  alt={product.name}
                                  className="card-image"
                                />
                                <div className="card-info">
                                  <h4 className="card-name">{product.name}</h4>
                                  <p className="card-price">
                                    {getPriceRange(product)}
                                  </p>
                                  {compareList.some(p => p.id === product.id) && (
                                    <span className="card-badge">已添加</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCompare;
