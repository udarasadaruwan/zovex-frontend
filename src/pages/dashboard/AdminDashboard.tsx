import React, { useEffect, useState } from 'react';
import { Activity, Boxes, CheckCircle2, Clock3, ShieldCheck, Star, TrendingUp, UsersRound } from 'lucide-react';
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
const percentage = (value = 0, total = 0) => (total ? Math.round((value / total) * 100) : 0);

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [roleMessage, setRoleMessage] = useState('');
  const [roleError, setRoleError] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState('');
  const [updatingRoleId, setUpdatingRoleId] = useState('');

  useEffect(() => {
    getUsers().then(setUsers).catch(() => setRoleError('Unable to load users.'));
    getCategories().then(setCategories).catch(() => setCategoryError('Unable to load categories.'));
    getDashboard('admin').then(setDashboard).catch(() => undefined);
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setRoleMessage('');
    setRoleError('');
    setUpdatingRoleId(userId);

    try {
      const updatedUser = await updateUserRole(userId, role);
      setUsers((current) => current.map((user) => ((user.id || user._id) === userId ? updatedUser : user)));
      setRoleMessage('User role updated.');
    } catch (requestError) {
      setRoleError(requestError instanceof Error ? requestError.message : 'Unable to update user role.');
    } finally {
      setUpdatingRoleId('');
    }
  };

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategoryMessage('');
    setCategoryError('');
    setCreatingCategory(true);

    try {
      const category = await createCategory({ name: categoryName });
      setCategories((current) => [category, ...current]);
      setCategoryName('');
      setCategoryMessage('Category created.');
    } catch (requestError) {
      setCategoryError(requestError instanceof Error ? requestError.message : 'Unable to create category.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCategoryDelete = async (categoryId: string) => {
    setCategoryMessage('');
    setCategoryError('');
    setDeletingCategoryId(categoryId);

    try {
      await deleteCategory(categoryId);
      setCategories((current) => current.filter((category) => category._id !== categoryId));
      setCategoryMessage('Category removed.');
    } catch (requestError) {
      setCategoryError(requestError instanceof Error ? requestError.message : 'Unable to remove category.');
    } finally {
      setDeletingCategoryId('');
    }
  };

  const roleCounts = users.reduce(
    (counts, user) => ({
      ...counts,
      [user.role]: counts[user.role] + 1
    }),
    { admin: 0, seller: 0, user: 0 }
  );
  const totalOrders = dashboard?.stats.orders || 0;
  const paidOrders = dashboard?.analytics?.paidOrders || 0;
  const pendingOrders = dashboard?.analytics?.pendingOrders || 0;
  const orderCompletion = percentage(paidOrders, totalOrders);
  const pendingShare = percentage(pendingOrders, totalOrders);
  const sellerShare = percentage(roleCounts.seller, users.length);
  const categoryCoverage = percentage(categories.length, Math.max(dashboard?.stats.products || 0, 1));

  return (
    <DashboardShell
      role="admin"
      title="Admin control center"
      description="Review users, sellers, product catalog health, categories, orders, and reviews."
      visibleStats={['users', 'sellers', 'products', 'categories', 'orders', 'reviews']}
    >
      <section className="dashboard-hero admin-dashboard-hero">
        <div>
          <p className="eyebrow">Command center</p>
          <h2>Keep Zovex operating cleanly</h2>
          <p>
            Watch platform health, keep catalog structure tidy, and move quickly when orders or user roles need attention.
          </p>
        </div>
        <div className="admin-health-card">
          <ShieldCheck size={26} />
          <span>Platform health</span>
          <strong>{Math.max(orderCompletion, categories.length ? 72 : 48)}%</strong>
          <div className="progress-track">
            <span style={{ width: `${Math.max(orderCompletion, categories.length ? 72 : 48)}%` }} />
          </div>
        </div>
      </section>

      <section className="dashboard-metric-strip">
        <article className="metric-card">
          <TrendingUp size={22} />
          <span>Revenue</span>
          <strong>{formatMoney(dashboard?.analytics?.totalRevenue || 0)}</strong>
        </article>
        <article className="metric-card">
          <CheckCircle2 size={22} />
          <span>Order completion</span>
          <strong>{orderCompletion}%</strong>
        </article>
        <article className="metric-card">
          <Clock3 size={22} />
          <span>Pending queue</span>
          <strong>{pendingShare}%</strong>
        </article>
        <article className="metric-card">
          <Star size={22} />
          <span>Average rating</span>
          <strong>{Number(dashboard?.analytics?.averageRating || 0).toFixed(1)}</strong>
        </article>
      </section>

      <section className="dashboard-split">
        <div className="dashboard-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">People</p>
              <h2>Role mix</h2>
            </div>
            <UsersRound size={24} />
          </div>
          <div className="role-mix">
            {(['user', 'seller', 'admin'] as UserRole[]).map((role) => (
              <div className="role-mix-row" key={role}>
                <span>{role}</span>
                <div className="progress-track">
                  <span style={{ width: `${percentage(roleCounts[role], users.length)}%` }} />
                </div>
                <strong>{roleCounts[role]}</strong>
              </div>
            ))}
          </div>
          <p className="muted-text">{sellerShare}% of registered accounts can manage inventory.</p>
        </div>

        <div className="dashboard-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Catalog structure</p>
              <h2>Category coverage</h2>
            </div>
            <Boxes size={24} />
          </div>
          <div className="category-cloud">
            {categories.slice(0, 10).map((category) => (
              <span key={category._id}>{category.name}</span>
            ))}
            {!categories.length && <p className="muted-text">Create categories to organize products.</p>}
          </div>
          <div className="progress-block">
            <div className="progress-track">
              <span style={{ width: `${Math.min(categoryCoverage, 100)}%` }} />
            </div>
            <strong>{categories.length} categories live</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Analytics</p>
            <h2>Store performance</h2>
          </div>
          <Activity size={24} />
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
                <div className="role-control">
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleChange(userId, event.target.value as UserRole)}
                    disabled={updatingRoleId === userId}
                    aria-busy={updatingRoleId === userId || undefined}
                  >
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  {updatingRoleId === userId && <span>Updating...</span>}
                </div>
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
          <Input
            id="categoryName"
            label="Category name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            disabled={creatingCategory}
            required
          />
          <Button loading={creatingCategory} loadingText="Creating..." disabled={creatingCategory}>
            Create category
          </Button>
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
                <Button
                  variant="ghost"
                  onClick={() => handleCategoryDelete(category._id)}
                  loading={deletingCategoryId === category._id}
                  loadingText="Removing..."
                  disabled={Boolean(deletingCategoryId)}
                >
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
