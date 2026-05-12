import { apiRequest } from './apiClient';
import type { CreateProductPayload, Product, ProductImage } from '../types';

interface ProductsResponse {
  products: Product[];
}

interface ProductResponse {
  product: Product;
}

export const getProducts = async () => {
  const data = await apiRequest<ProductsResponse>('/products');
  return data.products;
};

export const getProduct = async (id: string) => {
  const data = await apiRequest<ProductResponse>(`/products/${id}`);
  return data.product;
};

export const createProduct = async (payload: CreateProductPayload) => {
  const data = await apiRequest<ProductResponse>('/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.product;
};

export const uploadProductImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const data = await apiRequest<{ image: ProductImage }>('/upload/product-image', {
    method: 'POST',
    body: formData
  });

  return data.image;
};

export const getMySellerProducts = async () => {
  const data = await apiRequest<ProductsResponse>('/products/seller/mine');
  return data.products;
};

export const deleteProduct = async (productId: string) => {
  await apiRequest<void>(`/products/${productId}`, { method: 'DELETE' });
};
