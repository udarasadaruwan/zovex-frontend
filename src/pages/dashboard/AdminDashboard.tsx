import React, { useEffect, useState } from 'react';
import DashboardShell from './DashboardShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createCategory, deleteCategory, getCategories } from '../../services/categoryService';
import { getDashboard } from '../../services/dashboardService';
import { getUsers, updateUserRole } from '../../services/userService';
import type { Category, DashboardData, Order, Review, User, UserRole } from '../../types';

const formatMoney = (value = 0) => `$${value.toFixed(2)}`;
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'Recent');
const itemCount = (order: Order) => order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
const reviewProductName = (review: Review) =>
  typeof review.product === 'string' ? 'Product' : review.product?.name || 'Product';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [roleMessage, setRoleMessage] = useState('');
  const [roleError, setRoleError] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    getUsers().then(setUsers).catch(() => setRoleError('Unable to load users.'));
    getCategories().then(setCategories).catch(() => setCategoryError('Unable to load categories.'));
    getDashboard('admin').then(setDashboard).catch(() => undefined);
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setRoleMessage('');
    setRoleError('');

    try {
      const updatedUser = await updateUserRole(userId, role);
      setUsers((current) => current.map((user) => ((user.id || user._id) === userId ? updatedUser : user)));
      setRoleMessage('User role updated.');
    } catch (requestError) {
      setRoleError(requestError instanceof Error ? requestError.message : 'Unable to update user role.');
    }
  };

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategoryMessage('');
    setCategoryError('');

    try {
      const category = await createCategory({ name: categoryName });
      setCategories((current) => [category, ...current]);
      setCategoryName('');
      setCategoryMessage('Category created.');
    } catch (requestError) {
      setCategoryError(requestError instanceof Error ? requestError.message : 'Unable to create category.');
    }
  };

  const handleCategoryDelete = async (categoryId: string) => {
    setCategoryMessage('');
    setCategoryError('');

    try {
      await deleteCategory(categoryId);
      setCategories((current) => current.filter((category) => category._id !== categoryId));
      setCategoryMessage('Category removed.');
    } catch (requestError) {
      setCategoryError(requestError instanceof Error ? requestError.message : 'Unable to remove category.');
    }
  };

  return (
    <DashboardShell
      role="admin"
      title="Admin control center"
      description="Review users, sellers, product catalog health, categories, orders, and reviews."
      visibleStats={['users', 'sellers', 'products', 'categories', 'orders', 'reviews']}
    >
      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Store performance</h2>
        </div>
        <div className="analytics-grid">
          <article className="analytics-tile">
            <span>Total revenue</span>
            <strong>{formatMoney(dashboard?.analytics?.totalRevenue || 0)}</strong>
          </article>
          <article className="analytics-tile">
            <span>Paid orders</span>
            <strong>{dashboard?.analytics?.paidOrders || 0}</strong>
          </article>
          <article className="analytics-tile">
            <span>Pending orders</span>
            <strong>{dashboard?.analytics?.pendingOrders || 0}</strong>
          </article>
          <article className="analytics-tile">
            <span>Average rating</span>
            <strong>{Number(dashboard?.analytics?.averageRating || 0).toFixed(1)}</strong>
          </article>
        </div>
      </section>

      <section className="dashboard-split">
        <div className="dashboard-panel">
          <div>
            <p className="eyebrow">Orders</p>
            <h2>Recent orders</h2>
          </div>
          <div className="table-list">
            {dashboard?.recentOrders?.length ? (
              dashboard.recentOrders.map((order) => (
                <article className="insight-row" key={order._id}>
                  <div>
                    <strong>{order.user?.name || 'Customer'}</strong>
                    <span>
                      {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'} - {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <mark className={`status-pill status-${order.status}`}>{order.status}</mark>
                  <strong>{formatMoney(order.total)}</strong>
                </article>
              ))
            ) : (
              <p className="muted-text">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2>Latest feedback</h2>
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
          <h2>Top rated products</h2>
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
          <p className="eyebrow">Role management</p>
          <h2>Manage user roles</h2>
        </div>
        {roleMessage && <div className="success">{roleMessage}</div>}
        {roleError && <div className="alert">{roleError}</div>}
        <div className="table-list">
          {users.map((user) => {
            const userId = user.id || user._id || '';

            return (
              <article className="table-row" key={userId}>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <select value={user.role} onChange={(event) => handleRoleChange(userId, event.target.value as UserRole)}>
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Catalog setup</p>
          <h2>Categories</h2>
        </div>
        {categoryMessage && <div className="success">{categoryMessage}</div>}
        {categoryError && <div className="alert">{categoryError}</div>}
        <form className="inline-form" onSubmit={handleCategorySubmit}>
          <Input id="categoryName" label="Category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required />
          <Button>Create category</Button>
        </form>
        <div className="table-list">
          {categories.length === 0 ? (
            <p className="muted-text">No categories yet.</p>
          ) : (
            categories.map((category) => (
              <article className="table-row" key={category._id}>
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.slug || 'No slug'}</span>
                </div>
                <Button variant="ghost" onClick={() => handleCategoryDelete(category._id)}>
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
