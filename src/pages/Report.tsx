import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const REPORT_TYPES = [
  { value: 'user', label: 'User' },
  { value: 'worker', label: 'Worker' },
];

const ReportPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [type, setType] = useState('worker');
  const [reportedId, setReportedId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Sign in required', description: 'You must be signed in to report.', variant: 'destructive' });
      return;
    }
    if (!reportedId || !reason) {
      toast({ title: 'Missing fields', description: 'Please fill all fields.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reports').insert({
      reported_item_type: type,
      reported_item_id: reportedId,
      reporter_id: user.id,
      reason,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Report failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Report submitted', description: 'Thank you for your feedback.' });
      setReportedId('');
      setReason('');
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Report a User or Worker</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded shadow">
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block mb-1 font-medium">ID of {type === 'worker' ? 'Worker' : 'User'} to Report</label>
          <Input value={reportedId} onChange={e => setReportedId(e.target.value)} placeholder={`Enter ${type} ID`} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Reason</label>
          <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe the issue..." rows={4} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Report'}</Button>
      </form>
    </div>
  );
};

export default ReportPage; 