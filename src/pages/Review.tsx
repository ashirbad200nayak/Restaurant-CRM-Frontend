import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Review = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      await api.post('/reviews', {
        orderId,
        rating,
        comment: comment.trim(),
      });

      toast.success('Thank you for your review!');
      navigate(`/order/${orderId}?table=${tableNumber}`);
    } catch (error: any) {
      console.error('Review submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
          <CardDescription>
            How was your meal? Your feedback helps us improve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-3">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'w-10 h-10 transition-colors',
                        (hoveredRating >= value || rating >= value)
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 5 && 'Excellent!'}
                  {rating === 4 && 'Great!'}
                  {rating === 3 && 'Good!'}
                  {rating === 2 && 'Fair'}
                  {rating === 1 && 'Needs Improvement'}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                Comments (Optional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/order/${orderId}?table=${tableNumber}`)}
                className="flex-1"
              >
                Skip
              </Button>
              <Button type="submit" disabled={loading || rating === 0} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Review;
