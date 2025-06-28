import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';

interface Review {
  id: string;
  user_id: string;
  worker_id: number;
  rating: number;
  comment: string;
  user_name: string;
  status: string;
  created_at: string;
  worker_name?: string;
  reviewer_name?: string;
}

const PAGE_SIZE = 10;

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from('reviews')
      .select('*, user_id, worker_id, created_at')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (status) {
      query = query.eq('status', status);
    }
    const { data, count } = await query;
    // Fetch reviewer and worker names for display
    const reviewsWithNames = await Promise.all((data || []).map(async (review: any) => {
      let reviewer_name = '';
      let worker_name = '';
      if (review.user_id) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', review.user_id).single();
        if (profile) reviewer_name = profile.full_name;
      }
      if (review.worker_id) {
        const { data: worker } = await supabase.from('workers').select('full_name').eq('user_id', review.worker_id).single();
        if (worker) worker_name = worker.full_name;
      }
      return { ...review, reviewer_name, worker_name };
    }));
    setReviews(reviewsWithNames);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [status, page]);

  const handleStatus = async (review: Review, newStatus: string) => {
    const { error } = await supabase.from('reviews').update({ status: newStatus }).eq('id', review.id);
    if (error) {
      alert('Failed to update review status: ' + error.message);
      return;
    }
    fetchReviews();
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', review.id);
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Review Moderation</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-base text-gray-800 dark:text-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        >
          <option value="">All Statuses</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>
      <div className="overflow-x-auto bg-card rounded shadow">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Reviewer</th>
              <th className="px-4 py-2 text-left">Worker</th>
              <th className="px-4 py-2 text-left">Rating</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No reviews found.</td></tr>
            ) : reviews.map(review => (
              <tr key={review.id} className="hover:bg-muted cursor-pointer">
                <td className="px-4 py-2" onClick={() => setSelectedReview(review)}>{review.reviewer_name}</td>
                <td className="px-4 py-2" onClick={() => setSelectedReview(review)}>{review.worker_name}</td>
                <td className="px-4 py-2" onClick={() => setSelectedReview(review)}>{review.rating}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${review.status === 'visible' ? 'bg-green-100 text-green-700' : review.status === 'hidden' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{review.status}</span>
                </td>
                <td className="px-4 py-2">{new Date(review.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedReview(review)}>View</Button>
                  {review.status !== 'hidden' && <Button size="sm" variant="destructive" onClick={() => handleStatus(review, 'hidden')}>Hide</Button>}
                  {review.status === 'hidden' && <Button size="sm" variant="default" onClick={() => handleStatus(review, 'visible')}>Restore</Button>}
                  <Button size="sm" variant="secondary" onClick={() => handleStatus(review, 'flagged')}>Flag</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(review)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-muted-foreground">Page {page} of {Math.ceil(total / PAGE_SIZE) || 1}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total}>Next</Button>
        </div>
      </div>
      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setSelectedReview(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Review Details</h2>
            <div className="space-y-2">
              <div><span className="font-medium">Reviewer:</span> {selectedReview.reviewer_name}</div>
              <div><span className="font-medium">Worker:</span> {selectedReview.worker_name}</div>
              <div><span className="font-medium">Rating:</span> {selectedReview.rating}</div>
              <div><span className="font-medium">Status:</span> {selectedReview.status}</div>
              <div><span className="font-medium">Date:</span> {new Date(selectedReview.created_at).toLocaleString()}</div>
              <div><span className="font-medium">Comment:</span> {selectedReview.comment || <span className="text-muted-foreground">No comment</span>}</div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedReview(null)}>Close</Button>
              {selectedReview.status !== 'hidden' && <Button variant="destructive" onClick={() => { handleStatus(selectedReview, 'hidden'); setSelectedReview(null); }}>Hide</Button>}
              {selectedReview.status === 'hidden' && <Button variant="default" onClick={() => { handleStatus(selectedReview, 'visible'); setSelectedReview(null); }}>Restore</Button>}
              <Button variant="secondary" onClick={() => { handleStatus(selectedReview, 'flagged'); setSelectedReview(null); }}>Flag</Button>
              <Button variant="ghost" onClick={() => { handleDelete(selectedReview); setSelectedReview(null); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 