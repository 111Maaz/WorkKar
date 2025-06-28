import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import RatingStars from '@/components/UI/RatingStars';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';
import { MapPin, Phone, Star, Briefcase, Mail, Building, Send, ChevronLeft, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Skeleton } from '@/components/UI/skeleton';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/Layout/BottomNavigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';

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

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const [otherReason, setOtherReason] = useState('');

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
        .eq('status', 'visible')
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

  const handleReport = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'You must be signed in to report.', variant: 'destructive' });
      return;
    }
    if (!reportReason) {
      toast({ title: 'Missing reason', description: 'Please provide a reason for the report.', variant: 'destructive' });
      return;
    }
    if (reportReason === 'other' && !otherReason.trim()) {
      toast({ title: 'Missing description', description: 'Please describe the issue.', variant: 'destructive' });
      return;
    }
    setSubmittingReport(true);
    const { error } = await supabase.from('reports').insert({
      reported_item_type: 'worker',
      reported_item_id: worker.user_id,
      reporter_id: user.id,
      reason: reportReason,
      description: reportReason === 'other' ? otherReason : null,
      status: 'pending',
    });
    setSubmittingReport(false);
    setReportModalOpen(false);
    setReportReason('');
    setOtherReason('');
    if (error) {
      toast({ title: 'Report failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Report submitted', description: 'Thank you for your feedback.' });
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
      <div className="container mx-auto p-4 md:p-8 pb-24">
        <Card className="mb-8 overflow-hidden border-0 shadow-xl rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-pink-500" />
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                <Avatar className="w-32 h-32 text-6xl border-4 border-background bg-muted shadow-lg">
                    <AvatarImage src={worker.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${worker.full_name}`} alt={worker.full_name} />
                    <AvatarFallback>
                        {worker.full_name ? worker.full_name.slice(0, 2).toUpperCase() : '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {worker.full_name}
                    {worker.verification_status === 'approved' && (
                      <span className="inline-flex items-center ml-1" title="Verified Worker">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L19 5V11C19 16.52 12 22 12 22C12 22 5 16.52 5 11V5L12 2Z" fill="#22c55e" stroke="#22c55e" strokeWidth="1.5"/>
                          <path d="M9.5 12.5L11.5 14.5L15 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                    {/* Report icon, only if user is not the worker */}
                    {user && user.id !== worker.user_id && (
                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/80 hover:bg-white shadow-md z-20"
                        title="Report this worker"
                        aria-label="Report this worker"
                        style={{ color: '#EF4444' }}
                      >
                        <Flag size={18} />
                      </button>
                    )}
                  </h1>
                  <p className="text-lg text-primary font-medium">{worker.service_category}</p>
                  <p className="text-sm text-muted-foreground">{worker.service_subcategories?.join(', ')}</p>
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
                      {/* Email removed for privacy */}
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
      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNavigation />
      </div>
      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {worker.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-medium">Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate_behavior">Inappropriate Behavior</SelectItem>
                  <SelectItem value="poor_service">Poor Service Quality</SelectItem>
                  <SelectItem value="fake_profile">Fake Profile</SelectItem>
                  <SelectItem value="spam">Spam or Scam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportReason === 'other' && (
              <div>
                <label className="block mb-1 font-medium">Describe the issue</label>
                <Textarea value={otherReason} onChange={e => setOtherReason(e.target.value)} placeholder="Please describe the issue..." rows={3} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReport} disabled={submittingReport}>{submittingReport ? 'Submitting...' : 'Submit Report'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerProfilePage; 