import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  is_active: boolean;
  created_at: string;
  is_admin: boolean;
}

const PAGE_SIZE = 10;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const { toast } = useToast();
  const { user: currentAdmin } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, mobile_number, is_active, created_at, is_admin', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,mobile_number.ilike.%${search}%`);
    }
    const { data, count } = await query;
    setUsers(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const fetchChangeRequests = async () => {
    const { data } = await supabase.from('change_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    setChangeRequests(data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchChangeRequests();
    // eslint-disable-next-line
  }, [search, page]);

  const handleToggleActive = async (user: User) => {
    await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id);
    fetchUsers();
  };

  const handlePromoteToAdmin = async (user: User) => {
    setPromoting(user.id);
    const { error } = await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
    if (error) {
      toast({ title: 'Promotion Failed', description: error.message, variant: 'destructive' });
      setPromoting(null);
      return;
    }
    if (currentAdmin) {
      await supabase.from('admin_actions').insert({
        admin_id: currentAdmin.id,
        action_type: 'promote_to_admin',
        target_table: 'profiles',
        target_id: user.id,
        details: { email: user.email },
        created_at: new Date().toISOString()
      });
    }
    setPromoting(null);
    toast({ title: 'Promotion Successful', description: `${user.full_name} is now an admin.` });
    fetchUsers();
  };

  const handleRemoveAsAdmin = async (user: User) => {
    setPromoting(user.id);
    await supabase.from('profiles').update({ is_admin: false }).eq('id', user.id);
    if (currentAdmin) {
      await supabase.from('admin_actions').insert({
        admin_id: currentAdmin.id,
        action_type: 'remove_as_admin',
        target_table: 'profiles',
        target_id: user.id,
        details: { email: user.email },
        created_at: new Date().toISOString()
      });
    }
    setPromoting(null);
    alert(`${user.full_name} is no longer an admin.`);
  };

  const handleApprove = async (req: any) => {
    // Update user profile
    await supabase.from('profiles').update({ [req.field]: req.requested_value }).eq('id', req.user_id);
    // Mark request as approved
    await supabase.from('change_requests').update({ status: 'approved', admin_response: 'Approved and updated.' }).eq('id', req.id);
    toast({ title: 'Request approved', description: 'Profile updated.' });
    fetchChangeRequests();
  };
  const handleReject = async (req: any) => {
    await supabase.from('change_requests').update({ status: 'rejected', admin_response: 'Rejected by admin.' }).eq('id', req.id);
    toast({ title: 'Request rejected' });
    fetchChangeRequests();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto bg-card rounded shadow">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Active</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-muted cursor-pointer">
                <td className="px-4 py-2" onClick={() => setSelectedUser(user)}>{user.full_name}</td>
                <td className="px-4 py-2" onClick={() => setSelectedUser(user)}>{user.email}</td>
                <td className="px-4 py-2" onClick={() => setSelectedUser(user)}>{user.mobile_number}</td>
                <td className="px-4 py-2">
                  <button
                    className={`px-2 py-1 rounded ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>View</Button>
                  {user.is_admin ? (
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveAsAdmin(user)} disabled={promoting === user.id}>
                      {promoting === user.id ? 'Removing...' : 'Remove as Admin'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handlePromoteToAdmin(user)} disabled={promoting === user.id}>
                      {promoting === user.id ? 'Promoting...' : 'Promote to Admin'}
                    </Button>
                  )}
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
      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setSelectedUser(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="space-y-2">
              <div><span className="font-medium">Name:</span> {selectedUser.full_name}</div>
              <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
              <div><span className="font-medium">Phone:</span> {selectedUser.mobile_number}</div>
              <div><span className="font-medium">Active:</span> {selectedUser.is_active ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Created At:</span> {new Date(selectedUser.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
              <Button variant={selectedUser.is_active ? 'destructive' : 'default'} onClick={() => { handleToggleActive(selectedUser); setSelectedUser(null); }}>
                {selectedUser.is_active ? 'Deactivate' : 'Reactivate'}
              </Button>
              {selectedUser.is_admin ? (
                <Button size="sm" variant="destructive" onClick={() => handleRemoveAsAdmin(selectedUser)} disabled={promoting === selectedUser.id}>
                  {promoting === selectedUser.id ? 'Removing...' : 'Remove as Admin'}
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => handlePromoteToAdmin(selectedUser)} disabled={promoting === selectedUser.id}>
                  {promoting === selectedUser.id ? 'Promoting...' : 'Promote to Admin'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Change Requests Modal */}
      <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pending Change Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {changeRequests.length === 0 ? (
              <div className="text-muted-foreground">No pending requests.</div>
            ) : changeRequests.map(req => (
              <div key={req.id} className="p-3 rounded-lg bg-muted/30 border flex flex-col gap-1">
                <div><span className="font-semibold">User ID:</span> {req.user_id}</div>
                <div><span className="font-semibold">Field:</span> {req.field}</div>
                <div><span className="font-semibold">Current Value:</span> {req.current_value}</div>
                <div><span className="font-semibold">Requested Value:</span> {req.requested_value}</div>
                <div><span className="font-semibold">Reason:</span> {req.reason || <span className="italic text-muted-foreground">(none)</span>}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="default" onClick={() => handleApprove(req)}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(req)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 