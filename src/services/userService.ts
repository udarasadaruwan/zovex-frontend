import { apiRequest } from './apiClient';
import type { ShippingAddress, User, UserRole } from '../types';

interface UsersResponse {
  users: User[];
}

interface UserResponse {
  user: User;
}

export const getUsers = async () => {
  const data = await apiRequest<UsersResponse>('/users');
  return data.users;
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  const data = await apiRequest<UserResponse>(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
  return data.user;
};

export const updateProfile = async (payload: {
  name: string;
  phone?: string;
  address?: ShippingAddress;
}) => {
  const data = await apiRequest<UserResponse>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return data.user;
};

export const updatePassword = async (payload: { currentPassword: string; otp: string; password: string }) => {
  return apiRequest<{ message: string }>('/users/profile/password', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
};

export const requestProfilePasswordOtp = async () => {
  return apiRequest<{ message: string }>('/users/profile/password-otp', {
    method: 'POST'
  });
};

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const data = await apiRequest<UserResponse>('/users/profile/avatar', {
    method: 'PATCH',
    body: formData
  });
  return data.user;
};

export const deleteProfileImage = async () => {
  const data = await apiRequest<UserResponse>('/users/profile/avatar', {
    method: 'DELETE'
  });
  return data.user;
};
