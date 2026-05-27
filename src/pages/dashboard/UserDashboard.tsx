import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, CreditCard, PackageCheck, ShoppingBag, UserRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import DashboardShell from './DashboardShell';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getMyOrders } from '../../services/orderService';
import type { Order } from '../../types';

const formatMoney = (value = 0) => `$${value.toFixed(2)}`;
const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

const itemCount = (order: Order) => order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
const paidStatuses = new Set(['paid', 'processing', 'shipped', 'delivered']);
const orderSteps = ['created', 'paid', 'processing', 'delivered'];

const getProgressIndex = (status = '') => {
  const normalizedStatus = status.toLowerCase();

  if (['delivered', 'completed'].includes(normalizedStatus)) return 3;
  if (['processing', 'shipped'].includes(normalizedStatus)) return 2;
  if (['paid'].includes(normalizedStatus)) return 1;
  return 0;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { count, items, subtotal } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  const insights = useMemo(() => {
    const paidOrders = orders.filter((order) => paidStatuses.has(order.status));
    const totalSpent = paidOrders.reduce((total, order) => total + order.total, 0);
    const pendingOrders = orders.filter((order) => !paidStatuses.has(order.status)).length;
    const totalItems = orders.reduce((total, order) => total + itemCount(order), 0);

    return {
      lastOrder: orders[0],
      paidOrders: paidOrders.length,
      pendingOrders,
      totalItems,
      totalSpent
    };
  }, [orders]);

  const profileFields = [user?.name, user?.email, user?.phone, user?.address?.line1].filter(Boolean).length;
  const profileProgress = Math.round((profileFields / 4) * 100);
  const lastOrderProgress = getProgressIndex(insights.lastOrder?.status);

  return (
    <DashboardShell
      role="user"
      title="My shopping dashboard"
      description="Track orders, keep your cart ready, and manage the details that make checkout faster."
      visibleStats={['orders', 'cartItems']}
    >
      <section className="dashboard-hero user-dashboard-hero">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{user?.name || 'Zovex shopper'}</h2>
          <p>
            Your account is set up for quick shopping. Keep profile details current so orders and payment flows stay smooth.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <Button as={Link} to="/products">
            Shop products
            <ArrowRight size={18} />
          </Button>
          <Button as={Link} to="/profile" variant="secondary">
            Edit profile
          </Button>
        </div>
      </section>

      <section className="dashboard-metric-strip">
        <article className="metric-card">
          <CreditCard size={22} />
          <span>Total spent</span>
          <strong>{formatMoney(insights.totalSpent)}</strong>
        </article>
        <article className="metric-card">
          <PackageCheck size={22} />
          <span>Paid orders</span>
          <strong>{insights.paidOrders}</strong>
        </article>
        <article className="metric-card">
          <Clock3 size={22} />
          <span>Pending orders</span>
          <strong>{insights.pendingOrders}</strong>
        </article>
        <article className="metric-card">
          <ShoppingBag size={22} />
          <span>Items ordered</span>
          <strong>{insights.totalItems}</strong>
        </article>
      </section>

      <section className="dashboard-split">
        <div className="dashboard-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Cart status</p>
              <h2>Ready to checkout</h2>
            </div>
            <span className="mini-badge">{count} item{count === 1 ? '' : 's'}</span>
          </div>
          <div className="cart-snapshot">
            <div>
              <span>Cart value</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            <Button as={Link} to="/cart" variant={count ? 'primary' : 'secondary'}>
              View cart
            </Button>
          </div>
          <div className="table-list">
            {items.length ? (
              items.slice(0, 3).map((item) => (
                <article className="compact-product-row" key={item.product._id}>
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>
                      {item.quantity} x {formatMoney(item.product.price)}
                    </span>
                  </div>
                  <strong>{formatMoney(item.product.price * item.quantity)}</strong>
                </article>
              ))
            ) : (
              <p className="muted-text">Your cart is empty.</p>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Account health</p>
              <h2>Profile readiness</h2>
            </div>
            <UserRound size={24} />
          </div>
          <div className="progress-block">
            <div className="progress-track">
              <span style={{ width: `${profileProgress}%` }} />
            </div>
            <strong>{profileProgress}% complete</strong>
          </div>
          <div className="check-list">
            <span className={user?.email ? 'is-done' : ''}><CheckCircle2 size={16} /> Email saved</span>
            <span className={user?.phone ? 'is-done' : ''}><CheckCircle2 size={16} /> Phone number</span>
            <span className={user?.address?.line1 ? 'is-done' : ''}><CheckCircle2 size={16} /> Shipping address</span>
          </div>
          <Button as={Link} to="/profile" variant="secondary">
            Update details
          </Button>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Orders</p>
            <h2>Recent order activity</h2>
          </div>
          <Button as={Link} to="/products" variant="ghost">
            Continue shopping
          </Button>
        </div>

        {insights.lastOrder && (
          <div className="order-progress-card">
            <div>
              <span>Latest order</span>
              <strong>#{insights.lastOrder._id.slice(-6).toUpperCase()}</strong>
              <mark className={`status-pill status-${insights.lastOrder.status}`}>{insights.lastOrder.status}</mark>
            </div>
            <div className="timeline-track" aria-label="Latest order progress">
              {orderSteps.map((step, index) => (
                <span className={index <= lastOrderProgress ? 'is-active' : ''} key={step}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="table-list">
          {ordersLoading ? (
            <p className="muted-text">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="muted-text">No orders yet.</p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <article className="insight-row customer-order-row" key={order._id}>
                <div>
                  <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                  <span>
                    {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'} - {formatDate(order.createdAt)}
                  </span>
                </div>
                <mark className={`status-pill status-${order.status}`}>{order.status}</mark>
                <strong>{formatMoney(order.total)}</strong>
              </article>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
