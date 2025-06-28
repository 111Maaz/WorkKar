import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';

interface VerificationRequest {
  id: string;
  worker_id: number;
  user_id: string;
  document_type: 'aadhar' | 'pan';
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // Aadhar fields
  aadhar_name: string | null;
  aadhar_dob: string | null;
  aadhar_gender: string | null;
  aadhar_number: string | null;
  aadhar_vid: string | null;
  aadhar_image_url: string | null;
  // PAN fields
  pan_name: string | null;
  pan_dob: string | null;
  pan_parent_name: string | null;
  pan_number: string | null;
  pan_image_url: string | null;
  // Worker details
  worker: {
    full_name: string;
    email: string;
    mobile_number: string;
    business_name: string | null;
    service_category: string;
  };
}

const PAGE_SIZE = 10;

export default function VerificationRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('verification_requests')
      .select(`
        *,
        worker:workers!verification_requests_worker_id_fkey(
          id,
          full_name,
          email,
          mobile_number,
          business_name,
          service_category
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search) {
      query = query.or(`worker.full_name.ilike.%${search}%,worker.email.ilike.%${search}%,worker.mobile_number.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;
    
    if (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to load verification requests.",
        variant: "destructive"
      });
    } else {
      setRequests(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [search, status, page]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({ 
          status: newStatus, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Verification request ${newStatus} successfully.`,
      });

      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error: any) {
      console.error('Error updating verification request:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update verification request.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock size={12} /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle size={12} /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    return type === 'aadhar' ? '🆔' : '📄';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (requests === undefined) return <div>Error loading verification requests.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Verification Requests</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <Input
          placeholder="Search by worker name, email, or phone..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Select value={status || 'all'} onValueChange={value => { setStatus(value === 'all' ? '' : value); setPage(1); }}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Worker</th>
                <th className="px-4 py-2 text-left">Document Type</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Submitted</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No verification requests found.</td></tr>
              ) : requests.map(request => (
                <tr key={request.id} className="hover:bg-muted cursor-pointer">
                  <td className="px-4 py-2" onClick={() => setSelectedRequest(request)}>
                    <div>
                      <div className="font-medium">{request.worker?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{request.worker?.email}</div>
                      <div className="text-sm text-muted-foreground">{request.worker?.mobile_number}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2" onClick={() => setSelectedRequest(request)}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDocumentTypeIcon(request.document_type)}</span>
                      <span className="capitalize">{request.document_type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2" onClick={() => setSelectedRequest(request)}>
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-4 py-2" onClick={() => setSelectedRequest(request)}>
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-lg">{getDocumentTypeIcon(selectedRequest.document_type)}</span>
                Verification Request Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Worker Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Worker Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><span className="font-medium">Name:</span> {selectedRequest.worker?.full_name}</div>
                  <div><span className="font-medium">Email:</span> {selectedRequest.worker?.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedRequest.worker?.mobile_number}</div>
                  <div><span className="font-medium">Business:</span> {selectedRequest.worker?.business_name || 'N/A'}</div>
                  <div><span className="font-medium">Category:</span> {selectedRequest.worker?.service_category}</div>
                </CardContent>
              </Card>

              {/* Document Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{selectedRequest.document_type} Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedRequest.document_type === 'aadhar' ? (
                    <>
                      <div><span className="font-medium">Name:</span> {selectedRequest.aadhar_name}</div>
                      <div><span className="font-medium">Date of Birth:</span> {selectedRequest.aadhar_dob}</div>
                      <div><span className="font-medium">Gender:</span> {selectedRequest.aadhar_gender}</div>
                      {selectedRequest.aadhar_number && (
                        <div><span className="font-medium">Aadhar Number:</span> {selectedRequest.aadhar_number}</div>
                      )}
                      {selectedRequest.aadhar_vid && (
                        <div><span className="font-medium">VID:</span> {selectedRequest.aadhar_vid}</div>
                      )}
                    </>
                  ) : (
                    <>
                      <div><span className="font-medium">Name:</span> {selectedRequest.pan_name}</div>
                      <div><span className="font-medium">Date of Birth:</span> {selectedRequest.pan_dob}</div>
                      <div><span className="font-medium">Father/Mother Name:</span> {selectedRequest.pan_parent_name}</div>
                      <div><span className="font-medium">PAN Number:</span> {selectedRequest.pan_number}</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Request Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><span className="font-medium">Status:</span> {getStatusBadge(selectedRequest.status)}</div>
                  <div><span className="font-medium">Submitted:</span> {formatDate(selectedRequest.created_at)}</div>
                  {selectedRequest.updated_at !== selectedRequest.created_at && (
                    <div><span className="font-medium">Last Updated:</span> {formatDate(selectedRequest.updated_at)}</div>
                  )}
                  {selectedRequest.admin_notes && (
                    <div>
                      <span className="font-medium">Admin Notes:</span>
                      <div className="mt-1 p-2 bg-muted rounded text-sm">{selectedRequest.admin_notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Actions */}
              {selectedRequest.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Notes (Optional)</label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this verification request..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Approve Verification
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Reject Verification
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 