export type UserRole = 'user' | 'seller' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarPublicId?: string;
  phone?: string;
  address?: ShippingAddress;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export interface ProductImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  brand?: string;
  images?: ProductImage[];
  category?: Category;
  ratingAverage?: number;
  ratingCount?: number;
}

export interface Review {
  _id: string;
  product: string | Pick<Product, '_id' | 'name'>;
  user: Pick<User, '_id' | 'id' | 'name' | 'avatar'>;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  brand?: string;
  price: number;
  category: string;
  quantity: number;
  sku?: string;
  images?: ProductImage[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  phone?: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt?: string;
  user?: Pick<User, '_id' | 'id' | 'name' | 'email'>;
  items?: Array<{
    product: string | Pick<Product, '_id' | 'name'>;
    name?: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress?: ShippingAddress;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface DashboardStats {
  users?: number;
  sellers?: number;
  products?: number;
  categories?: number;
  orders?: number;
  reviews?: number;
  cartItems?: number;
}

export interface DashboardAnalytics {
  totalRevenue?: number;
  paidOrders?: number;
  pendingOrders?: number;
  averageRating?: number;
  lowStockItems?: number;
  topProducts?: Array<Pick<Product, '_id' | 'name' | 'price' | 'ratingAverage' | 'ratingCount'>>;
}

export interface DashboardData {
  role: UserRole;
  stats: DashboardStats;
  analytics?: DashboardAnalytics;
  recentOrders?: Order[];
  recentReviews?: Review[];
}
