import React, { useState, useEffect } from 'react';

const ProductReviews = ({ productId, userId, onReviewAdded }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);
      const data = await response.json();
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to leave a review');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setNewRating(5);
        fetchReviews();
        if (onReviewAdded) onReviewAdded();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="reviews-section">
      <h3>Customer Reviews</h3>
      <div className="rating-summary">
        <span className="average-rating">★ {averageRating.toFixed(1)}</span>
        <span>({reviews.length} reviews)</span>
      </div>

      <form onSubmit={handleSubmitReview} className="review-form">
        <div className="form-group">
          <label>Your Rating</label>
          <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
            {[5,4,3,2,1].map(r => (
              <option key={r} value={r}>{r} Stars</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Your Review</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            rows="3"
            placeholder="Share your experience with this product..."
          />
        </div>
        <button type="submit" className="btn">Submit Review</button>
      </form>

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <strong>{review.userName}</strong>
              <span className="review-rating">★ {review.rating}</span>
            </div>
            <p className="review-comment">{review.comment}</p>
            <small className="review-date">
              {new Date(review.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;