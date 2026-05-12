import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AuthSuccess from './pages/AuthSuccess';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './pages/DashboardRedirect';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import ProductList from './pages/ProductList';
import ProfileSettings from './pages/ProfileSettings';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user', 'seller', 'admin']}>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/seller"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancelled" element={<Navigate to="/cart" replace />} />
      </Route>
    </Routes>
  );
}
