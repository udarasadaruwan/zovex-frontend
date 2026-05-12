import { apiRequest } from './apiClient';
import type { DashboardData, UserRole } from '../types';

interface DashboardResponse {
  dashboard: DashboardData;
}

export const getDashboard = async (role: UserRole) => {
  const dashboardRole = role === 'admin' ? 'admin' : role === 'seller' ? 'seller' : 'user';
  const data = await apiRequest<DashboardResponse>(`/dashboard/${dashboardRole}`);
  return data.dashboard;
};
