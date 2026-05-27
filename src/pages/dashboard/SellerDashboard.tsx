import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import DashboardShell from './DashboardShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getCategories } from '../../services/categoryService';
import { getDashboard } from '../../services/dashboardService';
import { updateOrderStatus } from '../../services/orderService';
import { createProduct, deleteProduct, getMySellerProducts, uploadProductImage } from '../../services/productService';
import type { Category, DashboardData, Order, Product, Review } from '../../types';

const formatMoney = (value = 0) => `$${value.toFixed(2)}`;
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'Recent');
const itemCount = (order: Order) => order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
const reviewProductName = (review: Review) =>
  typeof review.product === 'string' ? 'Product' : review.product?.name || 'Product';
const orderNumber = (orderId: string) => `#${orderId.slice(-6).toUpperCase()}`;
const orderProductSummary = (order: Order) => {
  const names = order.items?.map((item) => item.name || (typeof item.product === 'string' ? 'Product' : item.product.name)).filter(Boolean) || [];
  if (names.length === 0) return 'Products not listed';
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
};
const fulfillmentStatuses = ['paid', 'processing', 'shipped', 'delivered'];
const statusChoicesFor = (status: string) => {
  const currentIndex = fulfillmentStatuses.indexOf(status);
  return currentIndex >= 0 ? fulfillmentStatuses.slice(currentIndex) : fulfillmentStatuses;
};

const emptyForm = {
  name: '',
  description: '',
  brand: '',
  price: '',
  category: '',
  quantity: '',
  sku: ''
};

export default function SellerDashboard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isCreating, setIsCreating] = useState(false);
  const [createNotice, setCreateNotice] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setError('Create a category first or ask admin to add one.'));
    getMySellerProducts().then(setProducts).catch(() => setError('Unable to load your products.'));
    getDashboard('seller').then(setDashboard).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!createNotice) return undefined;

    const timeoutId = window.setTimeout(() => setCreateNotice(''), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [createNotice]);

  useEffect(() => {
    if (!statusNotice) return undefined;

    const timeoutId = window.setTimeout(() => setStatusNotice(''), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [statusNotice]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsCreating(true);

    try {
      const images = imageFile ? [await uploadProductImage(imageFile)] : [];
      const product = await createProduct({
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        images
      });
      setProducts((current) => [product, ...current]);
      setMessage('Product created successfully.');
      setCreateNotice(`${product.name} was added to your catalog.`);
      setForm(emptyForm);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create product.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setMessage('');
    setError('');

    try {
      await deleteProduct(productId);
      setProducts((current) => current.filter((product) => product._id !== productId));
      setMessage('Product removed.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to remove product.');
    }
  };

  const handleOrderStatusChange = async (orderId: string, nextStatus: string) => {
    setMessage('');
    setError('');
    setStatusNotice('');
    setUpdatingOrderId(orderId);

    try {
      const updatedOrder = await updateOrderStatus(orderId, nextStatus);
      setDashboard((current) =>
        current
          ? {
              ...current,
              recentOrders: current.recentOrders?.map((order) =>
                order._id === orderId ? { ...order, status: updatedOrder.status } : order
              )
            }
          : current
      );
      setStatusNotice(`Order #${orderId.slice(-6).toUpperCase()} moved to ${nextStatus}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update order status.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  return (
    <DashboardShell
      role="seller"
      title="Seller workspace"
      description="Track your listed products and customer review activity."
      visibleStats={['products', 'reviews']}
    >
      {createNotice && (
        <div className="seller-success-popup" role="status" aria-live="polite">
          <span className="seller-success-icon">
            <CheckCircle2 size={28} />
          </span>
          <div>
            <strong>Product created</strong>
            <p>{createNotice}</p>
          </div>
        </div>
      )}

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Seller performance</h2>
        </div>
        <div className="analytics-grid">
          <article className="analytics-tile">
            <span>Product revenue</span>
            <strong>{formatMoney(dashboard?.analytics?.totalRevenue || 0)}</strong>
          </article>
          <article className="analytics-tile">
            <span>Average rating</span>
            <strong>{Number(dashboard?.analytics?.averageRating || 0).toFixed(1)}</strong>
          </article>
          <article className="analytics-tile">
            <span>Low stock items</span>
            <strong>{dashboard?.analytics?.lowStockItems || 0}</strong>
          </article>
        </div>
      </section>

      <section className="dashboard-split">
        <div className="dashboard-panel">
          <div>
            <p className="eyebrow">Orders</p>
            <h2>Recent product orders</h2>
          </div>
          <div className="table-list">
            {dashboard?.recentOrders?.length ? (
              dashboard.recentOrders.map((order) => (
                <article className="insight-row seller-order-row" key={order._id}>
                  <div>
                    <strong>Order {orderNumber(order._id)}</strong>
                    <span className="order-customer-name">{order.user?.name || 'Customer'}</span>
                    <span className="order-product-summary">{orderProductSummary(order)}</span>
                    <span>
                      {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'} - {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="order-status-control">
                    <mark className={`status-pill status-${order.status}`}>{order.status}</mark>
                    <select
                      aria-label={`Update order ${order._id.slice(-6).toUpperCase()} status`}
                      value={fulfillmentStatuses.includes(order.status) ? order.status : ''}
                      disabled={updatingOrderId === order._id || order.status === 'pending' || order.status === 'cancelled'}
                      onChange={(event) => handleOrderStatusChange(order._id, event.target.value)}
                    >
                      {!fulfillmentStatuses.includes(order.status) && <option value="">Waiting payment</option>}
                      {statusChoicesFor(order.status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {updatingOrderId === order._id && <span className="mini-saving">Saving...</span>}
                  </div>
                  <strong>{formatMoney(order.total)}</strong>
                </article>
              ))
            ) : (
              <p className="muted-text">No product orders yet.</p>
            )}
          </div>
          {statusNotice && <div className="success compact-notice">{statusNotice}</div>}
        </div>

        <div className="dashboard-panel">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2>Customer feedback</h2>
          </div>
          <div className="table-list">
            {dashboard?.recentReviews?.length ? (
              dashboard.recentReviews.map((review) => (
                <article className="insight-row insight-row-stacked" key={review._id}>
                  <div>
                    <strong>{review.user?.name || 'Customer'} rated {reviewProductName(review)}</strong>
                    <span>{review.rating}/5 stars - {formatDate(review.createdAt)}</span>
                    {review.comment && <p>{review.comment}</p>}
                  </div>
                </article>
              ))
            ) : (
              <p className="muted-text">No reviews yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Catalog insights</p>
          <h2>Best rated products</h2>
        </div>
        <div className="table-list">
          {dashboard?.analytics?.topProducts?.length ? (
            dashboard.analytics.topProducts.map((product) => (
              <article className="insight-row" key={product._id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{formatMoney(product.price)} - {product.ratingCount || 0} rating{(product.ratingCount || 0) === 1 ? '' : 's'}</span>
                </div>
                <strong>{Number(product.ratingAverage || 0).toFixed(1)}/5</strong>
              </article>
            ))
          ) : (
            <p className="muted-text">No rated products yet.</p>
          )}
        </div>
      </section>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Create product</h2>
        </div>
        {message && <div className="success">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <form className="product-form" onSubmit={handleSubmit}>
          <Input id="name" name="name" label="Product name" value={form.name} onChange={updateField} disabled={isCreating} required />
          <Input id="brand" name="brand" label="Brand" value={form.brand} onChange={updateField} disabled={isCreating} />
          <Input id="price" name="price" label="Price" type="number" min="0" value={form.price} onChange={updateField} disabled={isCreating} required />
          <Input
            id="quantity"
            name="quantity"
            label="Stock quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={updateField}
            disabled={isCreating}
            required
          />
          <Input id="sku" name="sku" label="SKU" value={form.sku} onChange={updateField} disabled={isCreating} />
          <label className="field" htmlFor="productImage">
            <span>Product image</span>
            <input
              ref={fileInputRef}
              className="file-input"
              id="productImage"
              type="file"
              accept="image/*"
              disabled={isCreating}
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
          </label>
          <label className="field" htmlFor="category">
            <span>Category</span>
            <select id="category" name="category" value={form.category} onChange={updateField} disabled={isCreating} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field product-description-field" htmlFor="description">
            <span>Description</span>
            <textarea id="description" name="description" value={form.description} onChange={updateField} disabled={isCreating} required />
          </label>
          <Button loading={isCreating} loadingText="Creating product..." disabled={isCreating}>
            Create product
          </Button>
        </form>
      </section>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">My catalog</p>
          <h2>Created products</h2>
        </div>
        <div className="table-list">
          {products.length === 0 ? (
            <p className="muted-text">No products created yet.</p>
          ) : (
            products.map((product) => (
              <article className="table-row product-row" key={product._id}>
                <div className="product-row-media">
                  {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.name} /> : <span>{product.name.charAt(0)}</span>}
                </div>
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {product.category?.name || 'No category'} - ${product.price.toFixed(2)}
                  </span>
                </div>
                <Button variant="ghost" onClick={() => handleDeleteProduct(product._id)}>
                  Remove
                </Button>
              </article>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
