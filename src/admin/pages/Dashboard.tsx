import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';

interface Metric {
  label: string;
  value: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      // Fetch counts
      const [{ count: userCount }, { count: workerCount }, { count: reviewCount }, { count: categoryCount }, { count: pendingWorkers }, { count: openReports }] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('workers').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('service_categories').select('id', { count: 'exact', head: true }),
        supabase.from('workers').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      setMetrics([
        { label: 'Total Users', value: userCount || 0 },
        { label: 'Total Workers', value: workerCount || 0 },
        { label: 'Total Reviews', value: reviewCount || 0 },
        { label: 'Total Categories', value: categoryCount || 0 },
        { label: 'Pending Worker Verifications', value: pendingWorkers || 0 },
        { label: 'Open Reports', value: openReports || 0 },
      ]);
      // Fetch recent signups (last 5)
      const { data: signups } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentSignups(signups || []);
      // Fetch recent reviews (last 5)
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, rating, comment, user_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentReviews(reviews || []);
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {loading ? (
        <div>Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="bg-card rounded shadow p-6 flex flex-col items-center">
              <div className="text-2xl font-bold text-primary mb-2">{m.value}</div>
              <div className="text-muted-foreground text-lg">{m.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Recent User Signups</h2>
          </div>
          <ul className="divide-y divide-border bg-card rounded shadow">
            {recentSignups.length === 0 && <li className="p-4 text-muted-foreground">No recent signups.</li>}
            {recentSignups.map((user) => (
              <li key={user.id} className="p-4 flex flex-col">
                <span className="font-medium">{user.full_name}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <span className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Recent Reviews</h2>
          </div>
          <ul className="divide-y divide-border bg-card rounded shadow">
            {recentReviews.length === 0 && <li className="p-4 text-muted-foreground">No recent reviews.</li>}
            {recentReviews.map((review) => (
              <li key={review.id} className="p-4 flex flex-col">
                <span className="font-medium">{review.user_name || 'User'}</span>
                <span className="text-sm text-muted-foreground">Rating: {review.rating}</span>
                <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleString()}</span>
                {review.comment && <span className="text-muted-foreground mt-1">"{review.comment}"</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <Button variant="default" onClick={() => window.location.href = '/admin/workers'}>
          Review Pending Worker Verifications
        </Button>
        <Button variant="destructive" onClick={() => window.location.href = '/admin/reports'}>
          Review Open Reports
        </Button>
      </div>
    </div>
  );
} 