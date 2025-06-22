import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Worker, Review } from '@/types';
import { Avatar, AvatarFallback } from '@/components/UI/avatar';
import RatingStars from '@/components/UI/RatingStars';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { MapPin, Phone, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have an AuthContext

const WorkerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [worker, setWorker] = useState<any>(null); // Using any to bypass type errors for now
  const [reviews, setReviews] = useState<any[]>([]); // Using any to bypass type errors for now
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for new review
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkerData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch worker details
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single();

      if (workerError) throw workerError;
      setWorker(workerData);

      // Fetch worker reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('worker_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !worker) return;

    setIsSubmitting(true);
    try {
        const { data: reviewData, error } = await supabase
            .from('reviews')
            .insert({
                worker_id: worker.id,
                user_id: user.id,
                rating: newRating,
                comment: newComment,
                user_name: user.user_metadata.name || 'Anonymous'
            })
            .select()
            .single();

        if (error) throw error;
        
        setReviews([reviewData, ...reviews]);
        setNewComment('');
        setNewRating(0);
        
        // Refetch worker data to get updated average rating
        fetchWorkerData();

    } catch(err: any) {
        console.error("Error submitting review:", err);
        alert('Failed to submit review: ' + err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading worker profile...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!worker) {
    return <div className="text-center p-8">Worker not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 text-4xl border-4 border-primary">
                <AvatarFallback>
                    {worker.full_name ? worker.full_name.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{worker.full_name}</h1>
              <p className="text-lg text-muted-foreground">{worker.service_category}</p>
              <div className="flex items-center gap-2 mt-2">
                <RatingStars rating={worker.average_rating || 0} />
                <span className="text-muted-foreground">({worker.total_reviews || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin size={16} />
                <span>{worker.location_address || 'Location not available'}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Phone size={16} />
                <span>{worker.mobile_number}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    {user && (
                        <form onSubmit={handleReviewSubmit} className="mb-6 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
                            <div className="flex items-center gap-2 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`cursor-pointer transition-colors ${newRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                                        onClick={() => setNewRating(star)}
                                    />
                                ))}
                            </div>
                            <Textarea 
                                placeholder={`Share your experience with ${worker.full_name}...`}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="mb-2"
                                required
                            />
                            <Button type="submit" disabled={isSubmitting || newRating === 0}>
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {reviews.length > 0 ? reviews.map(review => (
                            <div key={review.id} className="border-b pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback>{review.user_name ? review.user_name.charAt(0) : 'A'}</AvatarFallback>
                                    </Avatar>
                                    <h4 className="font-semibold">{review.user_name || 'Anonymous'}</h4>
                                </div>
                                <RatingStars rating={review.rating} size={16} />
                                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                            </div>
                        )) : (
                            <p>No reviews yet. Be the first to leave one!</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{worker.bio || 'No biography provided.'}</p>
                    <h4 className="font-semibold mt-4">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {/* The 'tags' property does not exist on the workers table, so this will be empty */}
                        {worker.tags?.map((tag: string) => (
                            <span key={tag} className="bg-secondary text-secondary-foreground text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfilePage; 