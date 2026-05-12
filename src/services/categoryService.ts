import { apiRequest } from './apiClient';
import type { Category } from '../types';

interface CategoriesResponse {
  categories: Category[];
}

interface CategoryResponse {
  category: Category;
}

export const getCategories = async () => {
  const data = await apiRequest<CategoriesResponse>('/categories');
  return data.categories;
};

export const createCategory = async (payload: { name: string; description?: string }) => {
  const data = await apiRequest<CategoryResponse>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.category;
};

export const deleteCategory = async (categoryId: string) => {
  await apiRequest<void>(`/categories/${categoryId}`, { method: 'DELETE' });
};
