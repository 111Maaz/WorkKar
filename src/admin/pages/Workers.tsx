import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';

interface Worker {
  id: number;
  user_id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  business_name: string;
  service_category: string;
  service_subcategory: string;
  verification_status: string;
  is_active: boolean;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Worker>>({});

  const fetchWorkers = async () => {
    setLoading(true);
    let query = supabase
      .from('workers')
      .select('id, user_id, full_name, email, mobile_number, business_name, service_category, service_subcategory, verification_status, is_active, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,mobile_number.ilike.%${search}%,business_name.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('service_category', category);
    }
    if (status) {
      query = query.eq('verification_status', status);
    }
    const { data, count } = await query;
    setWorkers(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line
  }, [search, category, status, page]);

  const handleToggleActive = async (worker: Worker) => {
    await supabase.from('workers').update({ is_active: !worker.is_active }).eq('id', worker.id);
    fetchWorkers();
  };

  const handleVerify = async (worker: Worker, newStatus: string) => {
    await supabase.from('workers').update({ verification_status: newStatus }).eq('id', worker.id);
    fetchWorkers();
  };

  const handleEdit = (worker: Worker) => {
    setEditForm(worker);
    setEditing(true);
  };

  const handleEditSave = async () => {
    if (!editForm.id) return;
    await supabase.from('workers').update(editForm).eq('id', editForm.id);
    setEditing(false);
    setSelectedWorker(null);
    fetchWorkers();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Worker Management</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <Input
          placeholder="Search by name, email, phone, or business..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by category..."
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border rounded px-2 py-1"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="overflow-x-auto bg-card rounded shadow">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Business</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Active</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4 text-center">Loading...</td></tr>
            ) : workers.length === 0 ? (
              <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No workers found.</td></tr>
            ) : workers.map(worker => (
              <tr key={worker.id} className="hover:bg-muted cursor-pointer">
                <td className="px-4 py-2" onClick={() => setSelectedWorker(worker)}>{worker.full_name}</td>
                <td className="px-4 py-2" onClick={() => setSelectedWorker(worker)}>{worker.email}</td>
                <td className="px-4 py-2" onClick={() => setSelectedWorker(worker)}>{worker.mobile_number}</td>
                <td className="px-4 py-2" onClick={() => setSelectedWorker(worker)}>{worker.business_name}</td>
                <td className="px-4 py-2" onClick={() => setSelectedWorker(worker)}>{worker.service_category}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${worker.verification_status === 'approved' ? 'bg-green-100 text-green-700' : worker.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{worker.verification_status}</span>
                </td>
                <td className="px-4 py-2">
                  <button
                    className={`px-2 py-1 rounded ${worker.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    onClick={() => handleToggleActive(worker)}
                  >
                    {worker.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedWorker(worker)}>View</Button>
                  <Button size="sm" variant="default" onClick={() => handleVerify(worker, 'approved')} disabled={worker.verification_status === 'approved'}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleVerify(worker, 'rejected')} disabled={worker.verification_status === 'rejected'}>Reject</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(worker)}>Edit</Button>
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
      {/* Worker Details Modal */}
      {selectedWorker && !editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setSelectedWorker(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Worker Details</h2>
            <div className="space-y-2">
              <div><span className="font-medium">Name:</span> {selectedWorker.full_name}</div>
              <div><span className="font-medium">Email:</span> {selectedWorker.email}</div>
              <div><span className="font-medium">Phone:</span> {selectedWorker.mobile_number}</div>
              <div><span className="font-medium">Business:</span> {selectedWorker.business_name}</div>
              <div><span className="font-medium">Category:</span> {selectedWorker.service_category}</div>
              <div><span className="font-medium">Subcategory:</span> {selectedWorker.service_subcategory}</div>
              <div><span className="font-medium">Status:</span> {selectedWorker.verification_status}</div>
              <div><span className="font-medium">Active:</span> {selectedWorker.is_active ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Created At:</span> {new Date(selectedWorker.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedWorker(null)}>Close</Button>
              <Button variant={selectedWorker.is_active ? 'destructive' : 'default'} onClick={() => { handleToggleActive(selectedWorker); setSelectedWorker(null); }}>
                {selectedWorker.is_active ? 'Deactivate' : 'Reactivate'}
              </Button>
              <Button variant="default" onClick={() => handleVerify(selectedWorker, 'approved')} disabled={selectedWorker.verification_status === 'approved'}>Approve</Button>
              <Button variant="destructive" onClick={() => handleVerify(selectedWorker, 'rejected')} disabled={selectedWorker.verification_status === 'rejected'}>Reject</Button>
              <Button variant="secondary" onClick={() => { setEditForm(selectedWorker); setEditing(true); }}>Edit</Button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Worker Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setEditing(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Edit Worker</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input value={editForm.full_name || ''} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className="mb-2" />
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="mb-2" />
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input value={editForm.mobile_number || ''} onChange={e => setEditForm(f => ({ ...f, mobile_number: e.target.value }))} className="mb-2" />
              <label className="block text-sm font-medium mb-1">Business</label>
              <Input value={editForm.business_name || ''} onChange={e => setEditForm(f => ({ ...f, business_name: e.target.value }))} className="mb-2" />
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input value={editForm.service_category || ''} onChange={e => setEditForm(f => ({ ...f, service_category: e.target.value }))} className="mb-2" />
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <Input value={editForm.service_subcategory || ''} onChange={e => setEditForm(f => ({ ...f, service_subcategory: e.target.value }))} className="mb-2" />
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="default" onClick={handleEditSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 