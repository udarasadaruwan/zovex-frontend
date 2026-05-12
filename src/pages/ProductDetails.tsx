import React from 'react';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProduct } from '../services/productService';
import { getProductReviews, saveProductReview } from '../services/reviewService';
import type { Product, Review } from '../types';

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProduct(id), getProductReviews(id)]).then(([nextProduct, nextReviews]) => {
      setProduct(nextProduct);
      setReviews(nextReviews);

      const userId = user?._id || user?.id;
      const currentReview = nextReviews.find((review) => (review.user?._id || review.user?.id) === userId);
      if (currentReview) {
        setRating(currentReview.rating);
        setComment(currentReview.comment || '');
      }
    });
  }, [id, user?._id, user?.id]);

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setReviewLoading(true);
    setReviewError('');
    setReviewMessage('');

    try {
      await saveProductReview(id, { rating, comment });
      const [nextProduct, nextReviews] = await Promise.all([getProduct(id), getProductReviews(id)]);
      setProduct(nextProduct);
      setReviews(nextReviews);
      setReviewMessage('Rating saved successfully.');
    } catch (requestError) {
      setReviewError(requestError instanceof Error ? requestError.message : 'Unable to save rating.');
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (value: number, size = 18) => {
    return Array.from({ length: 5 }, (_, index) => {
      const active = index + 1 <= Math.round(value);
      return <Star key={index} size={size} fill={active ? 'currentColor' : 'none'} />;
    });
  };

  const userId = user?._id || user?.id;
  const hasReviewed = reviews.some((review) => (review.user?._id || review.user?.id) === userId);

  useEffect(() => {
    if (!reviewMessage) return;
    const timer = window.setTimeout(() => setReviewMessage(''), 2400);
    return () => window.clearTimeout(timer);
  }, [reviewMessage]);

  if (!product) return <div className="status-line page-offset">Loading product...</div>;

  return (
    <>
      <section className="details-layout">
        <div className="details-media">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} />
          ) : (
            <div className="image-fallback large">{product.name}</div>
          )}
        </div>
        <div className="details-copy">
          <p className="eyebrow">{product.category?.name || 'Product'}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="details-meta">
            <strong>${product.price.toFixed(2)}</strong>
            <span>
              <Star size={18} fill="currentColor" />
              {Number(product.ratingAverage || 0).toFixed(1)} ({product.ratingCount || 0})
            </span>
          </div>
          <div className="quantity-row">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              min="1"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
          <Button onClick={() => addItem(product, quantity)}>Add to cart</Button>
        </div>
      </section>

      <section className="reviews-section">
        <div className="review-panel">
          <div>
            <p className="eyebrow">Customer rating</p>
            <h2>{hasReviewed ? 'Update your rating' : 'Rate this product'}</h2>
            <p>Share your experience to help other customers choose confidently.</p>
          </div>

          {isAuthenticated ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              {reviewMessage && <div className="success">{reviewMessage}</div>}
              {reviewError && <div className="alert">{reviewError}</div>}
              <div className="rating-picker" role="radiogroup" aria-label="Product rating">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={value <= rating ? 'selected' : ''}
                      aria-label={`${value} star${value === 1 ? '' : 's'}`}
                      aria-pressed={value === rating}
                      onClick={() => setRating(value)}
                    >
                      <Star size={26} fill="currentColor" />
                    </button>
                  );
                })}
              </div>
              <label className="field" htmlFor="review-comment">
                <span>Comment</span>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="What should others know about this product?"
                />
              </label>
              <Button disabled={reviewLoading}>{reviewLoading ? 'Saving rating...' : 'Save rating'}</Button>
            </form>
          ) : (
            <div className="review-signin">
              <p>Sign in to rate this product and write a review.</p>
              <Button as={Link} to="/login" variant="secondary">
                Sign in to review
              </Button>
            </div>
          )}
        </div>

        <div className="review-list">
          <div className="review-list-heading">
            <h2>Reviews</h2>
            <span>
              {Number(product.ratingAverage || 0).toFixed(1)} average from {product.ratingCount || 0} rating
              {(product.ratingCount || 0) === 1 ? '' : 's'}
            </span>
          </div>

          {reviews.length === 0 ? (
            <p className="muted-text">No reviews yet. Be the first to rate this product.</p>
          ) : (
            reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <div className="review-avatar">
                  {review.user?.avatar ? <img src={review.user.avatar} alt={review.user.name} /> : review.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="review-card-header">
                    <strong>{review.user?.name || 'Customer'}</strong>
                    <span>{renderStars(review.rating, 16)}</span>
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
