import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import DashboardShell from "./DashboardShell";
import { getMyOrders } from "../../services/orderService";
import type { Order } from "../../types";

export default function UserDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return (
    <DashboardShell
      role="user"
      title="My shopping dashboard"
      description="See your order activity and current cart status."
      visibleStats={["orders", "cartItems"]}
    >
      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Quick actions</p>
          <h2>Common account features</h2>
        </div>
        <div className="quick-actions">
          <Button as={Link} to="/products" variant="secondary">
            Browse products
          </Button>
          <Button as={Link} to="/cart" variant="secondary">
            View cart
          </Button>
        </div>
      </section>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Orders</p>
          <h2>Recent orders</h2>
        </div>
        <div className="table-list">
          {orders.length === 0 ? (
            <p className="muted-text">No orders yet.</p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <article className="table-row" key={order._id}>
                <div>
                  <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                  <span>{order.status}</span>
                </div>
                <strong>${order.total.toFixed(2)}</strong>
              </article>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
