import React from 'react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { getCategories } from '../services/categoryService';
import { getProducts } from '../services/productService';
import type { Category, Product } from '../types';

interface ProductListProps {
  compact?: boolean;
}

const PRODUCTS_PER_PAGE = 6;

export default function ProductList({ compact = false }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProducts(), compact ? Promise.resolve([]) : getCategories()])
      .then(([loadedProducts, loadedCategories]) => {
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load products.');
      })
      .finally(() => setLoading(false));
  }, [compact]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand?.toLowerCase().includes(normalizedQuery);
      const matchesCategory = selectedCategory === 'all' || product.category?._id === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [products, query, selectedCategory]);

  const selectedCategoryName =
    selectedCategory === 'all' ? 'all categories' : categories.find((category) => category._id === selectedCategory)?.name || 'category';
  const totalPages = compact ? 1 : Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const visibleProducts = compact
    ? filteredProducts.slice(0, 3)
    : filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  useEffect(() => {
    setPage(1);
  }, [query, selectedCategory]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{compact ? 'Featured catalog' : 'Product catalog'}</p>
          <h2>{compact ? 'Popular picks' : 'Browse products'}</h2>
        </div>
        {!compact && (
          <div className="product-tools">
            <label className="search-box">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
        )}
      </div>
      {!compact && categories.length > 0 && (
        <div className="category-filter" aria-label="Filter products by category">
          <button
            type="button"
            className={selectedCategory === 'all' ? 'is-active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              className={selectedCategory === category._id ? 'is-active' : ''}
              onClick={() => setSelectedCategory(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
      {!compact && !loading && !error && (
        <p className="filter-summary">
          Showing {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} in {selectedCategoryName}
        </p>
      )}
      {loading ? (
        <div className="status-line">Loading products...</div>
      ) : error ? (
        <div className="status-line">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="status-line">No products found.</div>
      ) : (
        <>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {!compact && totalPages > 1 && (
            <nav className="pagination" aria-label="Products pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Previous
              </button>
              <div className="pagination-pages">
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={page === pageNumber ? 'is-active' : ''}
                    aria-current={page === pageNumber ? 'page' : undefined}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
