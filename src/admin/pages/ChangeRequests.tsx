import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User, Building } from 'lucide-react';

interface ChangeRequest {
  id: string;
  user_id: string;
  field: string;
  current_value: string;
  requested_value: string;
  reason: string;
  status: string;
  admin_response: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

const PAGE_SIZE = 10;

export default function ChangeRequests() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('change_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (status) {
      query = query.eq('status', status);
    }
    const { data, count } = await query;
    
    // Fetch user details for each request
    const requestsWithDetails = await Promise.all((data || []).map(async (req: ChangeRequest) => {
      // Try fetching from profiles first
      let { data: userData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', req.user_id)
        .single();
      
      // If not in profiles, try workers
      if (!userData) {
        let { data: workerData } = await supabase
          .from('workers')
          .select('full_name, email')
          .eq('user_id', req.user_id)
          .single();
        userData = workerData;
      }
      
      return {
        ...req,
        user_name: userData?.full_name || 'Unknown User',
        user_email: userData?.email || 'No email'
      };
    }));
    
    setRequests(requestsWithDetails);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [status, page]);

  const handleApprove = async (req: ChangeRequest) => {
    try {
      // Invoke the new edge function to handle the approval
      const { data, error } = await supabase.functions.invoke('approve-change-request', {
        body: { requestId: req.id }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast({ title: 'Request Approved', description: `The ${req.field} has been updated successfully.` });
      fetchRequests(); // Refresh the list
    } catch (error: any) {
      toast({ title: 'Approval Failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleReject = async (req: ChangeRequest) => {
    try {
      await supabase
        .from('change_requests')
        .update({ 
          status: 'rejected', 
          admin_response: 'Rejected by admin.' 
        })
        .eq('id', req.id);
      
      toast({ title: 'Request rejected' });
      fetchRequests();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'approved': return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected': return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'approved': return `${baseClasses} bg-green-100 text-green-700`;
      case 'rejected': return `${baseClasses} bg-red-100 text-red-700`;
      default: return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">Change Requests Management</h1>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-base text-gray-800 dark:text-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Field</th>
                <th className="px-4 py-3 text-left font-semibold">Current Value</th>
                <th className="px-4 py-3 text-left font-semibold">Requested Value</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No change requests found.</td></tr>
              ) : requests.map(request => (
                <tr key={request.id} className="hover:bg-muted/20 cursor-pointer transition-colors">
                  <td className="px-4 py-3" onClick={() => setSelectedRequest(request)}>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      <div>
                        <div className="font-medium">{request.user_name}</div>
                        <div className="text-xs text-muted-foreground">{request.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={() => setSelectedRequest(request)}>
                    <span className="font-medium">{request.field}</span>
                  </td>
                  <td className="px-4 py-3" onClick={() => setSelectedRequest(request)}>
                    <span className="text-sm text-muted-foreground">{request.current_value || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3" onClick={() => setSelectedRequest(request)}>
                    <span className="font-medium text-green-600">{request.requested_value}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${getStatusBadge(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={() => setSelectedRequest(request)}>
                    <span className="text-sm text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>View</Button>
                      {request.status === 'pending' && (
                        <>
                          <Button size="sm" variant="default" onClick={() => handleApprove(request)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(request)}>Reject</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-muted-foreground">Page {page} of {Math.ceil(total / PAGE_SIZE) || 1}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total}>Next</Button>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Request Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><span className="font-medium">User:</span> {selectedRequest.user_name}</div>
              <div><span className="font-medium">Email:</span> {selectedRequest.user_email}</div>
              <div><span className="font-medium">Field:</span> {selectedRequest.field}</div>
              <div><span className="font-medium">Current Value:</span> {selectedRequest.current_value || 'N/A'}</div>
              <div><span className="font-medium">Requested Value:</span> {selectedRequest.requested_value}</div>
              <div><span className="font-medium">Reason:</span> {selectedRequest.reason || 'No reason provided'}</div>
              <div><span className="font-medium">Status:</span> {selectedRequest.status}</div>
              <div><span className="font-medium">Date:</span> {new Date(selectedRequest.created_at).toLocaleString()}</div>
              {selectedRequest.admin_response && (
                <div><span className="font-medium">Admin Response:</span> {selectedRequest.admin_response}</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
              {selectedRequest.status === 'pending' && (
                <>
                  <Button variant="default" onClick={() => { handleApprove(selectedRequest); setSelectedRequest(null); }}>Approve</Button>
                  <Button variant="destructive" onClick={() => { handleReject(selectedRequest); setSelectedRequest(null); }}>Reject</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 