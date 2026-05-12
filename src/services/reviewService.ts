import { apiRequest } from './apiClient';
import type { Review } from '../types';

interface ReviewsResponse {
  reviews: Review[];
}

interface ReviewResponse {
  review: Review;
}

export const getProductReviews = async (productId: string) => {
  const data = await apiRequest<ReviewsResponse>(`/reviews/product/${productId}`);
  return data.reviews;
};

export const saveProductReview = async (productId: string, payload: { rating: number; comment: string }) => {
  const data = await apiRequest<ReviewResponse>(`/reviews/product/${productId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.review;
};
