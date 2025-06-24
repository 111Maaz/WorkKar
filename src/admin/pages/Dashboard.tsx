import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { User, Users, Star, Layers, AlertTriangle, CheckCircle } from 'lucide-react';

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
      <h1 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500 animate-gradient">Admin Dashboard</h1>
      {loading ? (
        <div className="animate-pulse text-lg text-muted-foreground">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <div key={m.label} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="mb-2">
                {m.label.includes('User') && <User className="text-blue-500" size={32} />}
                {m.label.includes('Worker') && <Users className="text-pink-500" size={32} />}
                {m.label.includes('Review') && <Star className="text-yellow-500" size={32} />}
                {m.label.includes('Category') && <Layers className="text-purple-500" size={32} />}
                {m.label.includes('Pending') && <AlertTriangle className="text-orange-500 animate-pulse" size={32} />}
                {m.label.includes('Open Report') && <CheckCircle className="text-green-500 animate-bounce" size={32} />}
              </div>
              <div className="text-2xl font-bold text-primary mb-2 drop-shadow-lg">{m.value}</div>
              <div className="text-muted-foreground text-lg font-semibold">{m.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">Recent User Signups</h2>
          </div>
          <ul className="divide-y divide-border bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-xl">
            {recentSignups.length === 0 && <li className="p-4 text-muted-foreground">No recent signups.</li>}
            {recentSignups.map((user, i) => (
              <li key={user.id} className="p-4 flex flex-col animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="font-medium text-blue-700 dark:text-blue-300">{user.full_name}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <span className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">Recent Reviews</h2>
          </div>
          <ul className="divide-y divide-border bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-xl">
            {recentReviews.length === 0 && <li className="p-4 text-muted-foreground">No recent reviews.</li>}
            {recentReviews.map((review, i) => (
              <li key={review.id} className="p-4 flex flex-col animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="font-medium text-pink-700 dark:text-pink-300">{review.user_name || 'User'}</span>
                <span className="text-sm text-muted-foreground">Rating: {review.rating}</span>
                <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleString()}</span>
                {review.comment && <span className="text-muted-foreground mt-1">"{review.comment}"</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <Button variant="default" className="bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-lg hover:scale-105 transition-transform" onClick={() => window.location.href = '/admin/workers'}>
          Review Pending Worker Verifications
        </Button>
        <Button variant="destructive" className="bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:scale-105 transition-transform" onClick={() => window.location.href = '/admin/reports'}>
          Review Open Reports
        </Button>
      </div>
    </div>
  );
} 