import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ShoppingBag, Star, Tags, Users } from 'lucide-react';
import { getDashboard } from '../../services/dashboardService';
import type { DashboardData, DashboardStats, UserRole } from '../../types';

interface DashboardShellProps {
  role: UserRole;
  title: string;
  description: string;
  visibleStats: Array<keyof DashboardStats>;
  children?: React.ReactNode;
}

const statLabels: Record<keyof DashboardStats, { label: string; icon: React.ElementType }> = {
  users: { label: 'Users', icon: Users },
  sellers: { label: 'Sellers', icon: Users },
  products: { label: 'Products', icon: Package },
  categories: { label: 'Categories', icon: Tags },
  orders: { label: 'Orders', icon: ShoppingBag },
  reviews: { label: 'Reviews', icon: Star },
  cartItems: { label: 'Cart items', icon: BarChart3 }
};

export default function DashboardShell({ role, title, description, visibleStats, children }: DashboardShellProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard(role)
      .then(setDashboard)
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard.');
      });
  }, [role]);

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="eyebrow">{role} dashboard</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {error ? (
        <div className="status-line">{error}</div>
      ) : !dashboard ? (
        <div className="status-line">Loading dashboard...</div>
      ) : (
        <div className="dashboard-grid">
          {visibleStats.map((statKey) => {
            const stat = statLabels[statKey];
            const Icon = stat.icon;

            return (
              <article className="dashboard-card" key={statKey}>
                <Icon size={24} />
                <span>{stat.label}</span>
                <strong>{dashboard.stats[statKey] ?? 0}</strong>
              </article>
            );
          })}
        </div>
      )}
      {children && <div className="dashboard-actions">{children}</div>}
    </section>
  );
}
