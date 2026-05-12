import React, { useState } from 'react';
import { LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from './ui/Button';

export default function Navbar() {
  const { count } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${menuOpen ? 'menu-open' : ''}`}>
      <Link className="brand" to="/" onClick={closeMenu}>
        Zovex
      </Link>
      <button
        className="nav-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-controls="primary-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <div className="nav-menu" id="primary-navigation">
        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/products" onClick={closeMenu}>Products</NavLink>
          {isAuthenticated && <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>}
          <NavLink to="/cart" className="cart-link" onClick={closeMenu}>
            <ShoppingBag size={18} />
            Cart
            {count > 0 && <span className="cart-count">{count}</span>}
          </NavLink>
        </nav>
        <div className="nav-actions">
          {isAuthenticated && user ? (
            <>
              <Link className="user-pill" to="/profile" title="Profile settings" onClick={closeMenu}>
                <UserRound size={16} />
                {user.name} ({user.role})
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" onClick={closeMenu}>
                Sign in
              </Button>
              <Button as={Link} to="/register" onClick={closeMenu}>
                Create account
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
