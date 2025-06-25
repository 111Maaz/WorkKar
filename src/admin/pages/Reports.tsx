import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';

interface Report {
  id: string;
  reported_item_type: string;
  reported_item_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_name?: string;
  item_details?: any;
}

const PAGE_SIZE = 10;

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase
      .from('reports')
      .select('id, reported_item_type, reported_item_id, reporter_id, reason, status, created_at')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (status) {
      query = query.eq('status', status);
    }
    const { data, count } = await query;
    // Fetch reporter name and reported item details
    const reportsWithDetails = await Promise.all((data || []).map(async (report: Report) => {
      let reporter_name = '';
      let item_details: any = null;
      // Fetch reporter name
      const { data: reporterData } = await supabase.from('profiles').select('full_name').eq('id', report.reporter_id).single();
      if (reporterData) reporter_name = reporterData.full_name;
      // Fetch reported item details
      if (report.reported_item_type === 'user') {
        const { data: userData } = await supabase.from('profiles').select('full_name, email, is_active').eq('id', report.reported_item_id).single();
        if (userData) item_details = userData;
      } else if (report.reported_item_type === 'worker') {
        const { data: workerData } = await supabase.from('workers').select('full_name, email, is_active, verification_status').eq('user_id', report.reported_item_id).single();
        if (workerData) item_details = workerData;
      } else if (report.reported_item_type === 'review') {
        const { data: reviewData } = await supabase.from('reviews').select('user_name, comment, status').eq('id', report.reported_item_id).single();
        if (reviewData) item_details = reviewData;
      }
      return { ...report, reporter_name, item_details };
    }));
    setReports(reportsWithDetails);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [status, page]);

  const handleStatus = async (report: Report, newStatus: string) => {
    await supabase.from('reports').update({ status: newStatus }).eq('id', report.id);
    fetchReports();
  };

  // Admin actions on reported items
  const handleDeactivateUser = async (userId: string) => {
    await supabase.from('profiles').update({ is_active: false }).eq('id', userId);
    fetchReports();
  };
  const handleDeactivateWorker = async (userId: string) => {
    await supabase.from('workers').update({ is_active: false }).eq('user_id', userId);
    fetchReports();
  };
  const handleHideReview = async (reviewId: string) => {
    await supabase.from('reviews').update({ status: 'hidden' }).eq('id', reviewId);
    fetchReports();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Reports Management</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-base text-gray-800 dark:text-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="overflow-x-auto bg-card rounded shadow">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Reporter</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No reports found.</td></tr>
            ) : reports.map(report => (
              <tr key={report.id} className="hover:bg-muted cursor-pointer">
                <td className="px-4 py-2" onClick={() => setSelectedReport(report)}>{report.reporter_name}</td>
                <td className="px-4 py-2" onClick={() => setSelectedReport(report)}>{report.reported_item_type}</td>
                <td className="px-4 py-2" onClick={() => setSelectedReport(report)}>{report.reason}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : report.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{report.status}</span>
                </td>
                <td className="px-4 py-2">{new Date(report.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>View</Button>
                  {report.status !== 'reviewed' && <Button size="sm" variant="default" onClick={() => handleStatus(report, 'reviewed')}>Mark Reviewed</Button>}
                  {report.status !== 'resolved' && <Button size="sm" variant="secondary" onClick={() => handleStatus(report, 'resolved')}>Resolve</Button>}
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
      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setSelectedReport(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Report Details</h2>
            <div className="space-y-2">
              <div><span className="font-medium">Reporter:</span> {selectedReport.reporter_name}</div>
              <div><span className="font-medium">Type:</span> {selectedReport.reported_item_type}</div>
              <div><span className="font-medium">Reason:</span> {selectedReport.reason}</div>
              <div><span className="font-medium">Status:</span> {selectedReport.status}</div>
              <div><span className="font-medium">Date:</span> {new Date(selectedReport.created_at).toLocaleString()}</div>
              <div><span className="font-medium">Reported Item Details:</span>
                <pre className="bg-muted rounded p-2 mt-1 text-xs overflow-x-auto">{JSON.stringify(selectedReport.item_details, null, 2)}</pre>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>Close</Button>
              {selectedReport.status !== 'reviewed' && <Button variant="default" onClick={() => { handleStatus(selectedReport, 'reviewed'); setSelectedReport(null); }}>Mark Reviewed</Button>}
              {selectedReport.status !== 'resolved' && <Button variant="secondary" onClick={() => { handleStatus(selectedReport, 'resolved'); setSelectedReport(null); }}>Resolve</Button>}
              {/* Admin actions on reported item */}
              {selectedReport.reported_item_type === 'user' && <Button variant="destructive" onClick={() => { handleDeactivateUser(selectedReport.reported_item_id); setSelectedReport(null); }}>Deactivate User</Button>}
              {selectedReport.reported_item_type === 'worker' && <Button variant="destructive" onClick={() => { handleDeactivateWorker(selectedReport.reported_item_id); setSelectedReport(null); }}>Deactivate Worker</Button>}
              {selectedReport.reported_item_type === 'review' && <Button variant="destructive" onClick={() => { handleHideReview(selectedReport.reported_item_id); setSelectedReport(null); }}>Hide Review</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 