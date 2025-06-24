import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import RatingStars from '@/components/UI/RatingStars';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';
import { MapPin, Phone, Star, Briefcase, Mail, Building, Send, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Skeleton } from '@/components/UI/skeleton';
import { useToast } from '@/hooks/use-toast';

const WorkerProfileSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8">
    <Card className="mb-8 overflow-hidden">
      <div className="h-32 bg-muted" />
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
          <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
          <div className="flex-1 text-center md:text-left">
            <Skeleton className="h-8 w-48 mt-4" />
            <Skeleton className="h-6 w-32 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Skeleton className="h-10 w-full" />
        <Card className="mt-4">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const WorkerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .select(`*, author:profiles(id, full_name, avatar_url)`)
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

    if (newRating === 0) {
      toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: reviewData, error } = await supabase
        .from('reviews')
        .insert({
          worker_id: worker.id,
          user_id: user.id,
          rating: newRating,
          comment: newComment,
        })
        .select(`*, author:profiles(id, full_name, avatar_url)`)
        .single();

      if (error) throw error;
      
      setReviews([reviewData, ...reviews]);
      setNewComment('');
      setNewRating(0);
      
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });

      fetchWorkerData(); // Refetch worker data for updated average rating
    } catch(err: any) {
      console.error("Error submitting review:", err);
      toast({ title: "Submission Failed", description: err.message || "Failed to submit review.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <WorkerProfileSkeleton />;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!worker) {
    return <div className="text-center p-8">Worker not found.</div>;
  }
  
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="bg-muted/30">
      {/* Back button for mobile */}
      <div className="md:hidden px-4 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="container mx-auto p-4 md:p-8">
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/30" />
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                <Avatar className="w-32 h-32 text-6xl border-4 border-background bg-muted shadow-lg">
                    <AvatarImage src={worker.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${worker.full_name}`} alt={worker.full_name} />
                    <AvatarFallback>
                        {worker.full_name ? worker.full_name.slice(0, 2).toUpperCase() : '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold">{worker.full_name}</h1>
                  <p className="text-lg text-primary font-medium">{worker.service_category} - {worker.service_subcategory}</p>
                </div>
                <div className="flex items-center gap-2">
                    <RatingStars rating={averageRating} size={20} />
                    <span className="text-muted-foreground font-semibold">({reviews.length} reviews)</span>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About {worker.full_name.split(' ')[0]}</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="about">
                <Card className="mt-4">
                  <CardHeader><CardTitle>Biography</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{worker.bio || 'No biography provided. This professional is focused on delivering quality work.'}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews">
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Customer Feedback</CardTitle>
                        <CardDescription>See what others are saying about {worker.full_name}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {user && user.id !== worker.user_id && (
                            <form onSubmit={handleReviewSubmit} className="p-4 border rounded-lg bg-background">
                                <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={22}
                                            className={`cursor-pointer transition-all duration-150 ${newRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                                            onClick={() => setNewRating(star)}
                                        />
                                    ))}
                                </div>
                                <Textarea 
                                    placeholder={`Share your experience...`}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="mb-3"
                                    required
                                />
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Review'} <Send size={16} className="ml-2" />
                                </Button>
                            </form>
                        )}
                        {user && user.id === worker.user_id && <p className="text-sm text-center text-muted-foreground p-4">This is your public profile. You cannot review yourself.</p>}
                        {!user && <p className="text-sm text-center text-muted-foreground p-4">Please <Link to="/auth" className="text-primary underline">sign in</Link> to leave a review.</p>}

                        <div className="space-y-6">
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review.id} className="flex gap-4">
                                    <Avatar>
                                      <AvatarImage src={review.author?.avatar_url} alt={review.author?.full_name}/>
                                      <AvatarFallback>{review.author?.full_name ? review.author.full_name.charAt(0) : 'A'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-center">
                                        <h4 className="font-semibold">{review.author?.full_name || 'Anonymous'}</h4>
                                        <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <RatingStars rating={review.rating} size={16} className="my-1"/>
                                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-8 text-muted-foreground">No reviews yet. Be the first to leave one!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="md:col-span-1 sticky top-8">
              <Card>
                  <CardHeader>
                      <CardTitle>Contact & Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                      {worker.business_name && 
                        <div className="flex items-center gap-3">
                            <Building size={16} className="text-muted-foreground" />
                            <span>{worker.business_name}</span>
                        </div>
                      }
                      <div className="flex items-center gap-3">
                          <Mail size={16} className="text-muted-foreground" />
                          <span>{worker.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <Phone size={16} className="text-muted-foreground" />
                          <span>{worker.mobile_number}</span>
                      </div>
                      <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-muted-foreground mt-1" />
                          <span>{worker.location_address || 'Location not available'}</span>
                      </div>
                  </CardContent>
                  <CardContent>
                      <a href={`tel:${worker.mobile_number}`} className="w-full">
                        <Button className="w-full" size="lg">
                            <Phone size={16} className="mr-2" />
                            Hire Me
                        </Button>
                      </a>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfilePage; 