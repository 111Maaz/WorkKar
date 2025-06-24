import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';

interface AuditAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_table: string;
  target_id: string;
  details: any;
  created_at: string;
  admin_name?: string;
}

const PAGE_SIZE = 10;

export default function AuditLog() {
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [actionType, setActionType] = useState('');
  const [adminName, setAdminName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchActions = async () => {
    setLoading(true);
    let query = supabase
      .from('admin_actions')
      .select('id, admin_id, action_type, target_table, target_id, details, created_at')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (actionType) query = query.eq('action_type', actionType);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);
    const { data, count } = await query;
    // Fetch admin names
    const actionsWithNames = await Promise.all((data || []).map(async (action: AuditAction) => {
      let admin_name = '';
      if (action.admin_id) {
        const { data: adminData } = await supabase.from('profiles').select('full_name').eq('id', action.admin_id).single();
        if (adminData) admin_name = adminData.full_name;
      }
      return { ...action, admin_name };
    }));
    // Filter by admin name or search string if needed
    let filtered = actionsWithNames;
    if (adminName) filtered = filtered.filter(a => a.admin_name?.toLowerCase().includes(adminName.toLowerCase()));
    if (search) filtered = filtered.filter(a =>
      a.action_type.toLowerCase().includes(search.toLowerCase()) ||
      a.target_table.toLowerCase().includes(search.toLowerCase()) ||
      a.target_id.toLowerCase().includes(search.toLowerCase())
    );
    setActions(filtered);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchActions(); /* eslint-disable-next-line */ }, [actionType, adminName, dateFrom, dateTo, page, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input
          placeholder="Search action, table, or record..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by admin name..."
          value={adminName}
          onChange={e => { setAdminName(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by action type..."
          value={actionType}
          onChange={e => { setActionType(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <div className="flex flex-col">
          <label className="text-xs mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="border rounded px-2 py-1" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="border rounded px-2 py-1" />
        </div>
      </div>
      <div className="overflow-x-auto bg-card rounded shadow">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Admin</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Table</th>
              <th className="px-4 py-2 text-left">Record ID</th>
              <th className="px-4 py-2 text-left">Details</th>
              <th className="px-4 py-2 text-left">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : actions.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No audit actions found.</td></tr>
            ) : actions.map(action => (
              <tr key={action.id} className="hover:bg-muted">
                <td className="px-4 py-2">{action.admin_name || action.admin_id}</td>
                <td className="px-4 py-2">{action.action_type}</td>
                <td className="px-4 py-2">{action.target_table}</td>
                <td className="px-4 py-2">{action.target_id}</td>
                <td className="px-4 py-2"><pre className="bg-muted rounded p-2 text-xs overflow-x-auto max-w-xs">{JSON.stringify(action.details, null, 2)}</pre></td>
                <td className="px-4 py-2">{new Date(action.created_at).toLocaleString()}</td>
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
    </div>
  );
} 