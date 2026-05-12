import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import Button from './ui/Button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const image = product.images?.[0]?.url;

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-wrap">
        {image ? <img src={image} alt={product.name} /> : <div className="image-fallback">{product.name}</div>}
      </Link>
      <div className="product-card-body">
        <p className="eyebrow">{product.category?.name || 'Featured'}</p>
        <Link to={`/products/${product._id}`} className="product-title">
          {product.name}
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <strong>${product.price.toFixed(2)}</strong>
          <span>
            <Star size={15} fill="currentColor" />
            {Number(product.ratingAverage || 0).toFixed(1)}
          </span>
        </div>
        <Button fullWidth onClick={() => addItem(product)}>
          Add to cart
        </Button>
      </div>
    </article>
  );
}
