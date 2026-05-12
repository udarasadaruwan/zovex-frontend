import React from 'react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/productService';
import type { Product } from '../types';

interface ProductListProps {
  compact?: boolean;
}

export default function ProductList({ compact = false }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load products.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{compact ? 'Featured catalog' : 'Product catalog'}</p>
          <h2>{compact ? 'Popular picks' : 'Browse products'}</h2>
        </div>
        {!compact && (
          <label className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        )}
      </div>
      {loading ? (
        <div className="status-line">Loading products...</div>
      ) : error ? (
        <div className="status-line">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="status-line">No products found.</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.slice(0, compact ? 3 : filteredProducts.length).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
