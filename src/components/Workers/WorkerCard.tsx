import React, { useState } from 'react';
import { MapPin, Phone, Flag, ShieldCheck } from 'lucide-react';
import { Worker } from '@/types';
import { Button } from '@/components/UI/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from "@/components/UI/avatar";
import RatingStars from '@/components/UI/RatingStars';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkerCardProps {
  worker: Worker;
  className?: string;
  userLocation: { latitude: number; longitude: number; } | null;
  onDistanceClick: () => void;
}

const categoryColors: { [key: string]: string } = {
  'Construction': 'border-t-red-500',
  'Plumbing': 'border-t-blue-500',
  'Electrical': 'border-t-yellow-500',
  'Carpentry': 'border-t-orange-500',
  'Painting': 'border-t-purple-500',
  'Welding': 'border-t-gray-500',
  'Home Tutor': 'border-t-green-500',
  'Flooring / Tiles': 'border-t-indigo-500',
  'False Ceiling': 'border-t-cyan-500',
  'Tailoring': 'border-t-pink-500',
  'Cleaning': 'border-t-teal-500',
  'Auto Repair': 'border-t-amber-500',
  'default': 'border-t-slate-500'
};

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, className, userLocation, onDistanceClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open device's default dialer with pre-filled number
    window.location.href = `tel:${worker.mobile}`;
  };

  const handleCardClick = () => {
    navigate(`/worker/${worker.id}`);
  };

  const handleKnowDistanceClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (!user) {
      // If user is not logged in, go to auth page
      navigate('/auth');
    } else if (!userLocation) {
      // If user is logged in but location is not available, let parent handle it
      onDistanceClick();
    }
    // If userLocation is available, the distance is already shown, so this button isn't rendered.
    // However, if logic were to change, we'd do nothing here.
  };

  const handleReport = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'You must be signed in to report.', variant: 'destructive' });
      return;
    }
    if (!reportReason) {
      toast({ title: 'Missing reason', description: 'Please provide a reason for the report.', variant: 'destructive' });
      return;
    }
    if (reportReason === 'other' && !otherReason.trim()) {
      toast({ title: 'Missing description', description: 'Please describe the issue.', variant: 'destructive' });
      return;
    }
    setSubmittingReport(true);
    const { error } = await supabase.from('reports').insert({
      reported_item_type: 'worker',
      reported_item_id: worker.user_id,
      reporter_id: user.id,
      reason: reportReason,
      description: reportReason === 'other' ? otherReason : null,
      status: 'pending',
    });
    setSubmittingReport(false);
    setReportModalOpen(false);
    setReportReason('');
    setOtherReason('');
    if (error) {
      toast({ title: 'Report failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Report submitted', description: 'Thank you for your feedback.' });
    }
  };

  const accentColor = categoryColors[worker.category] || categoryColors['default'];

  return (
    <div
      className={cn(
        "relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out",
        "border-l border-r border-b border-border/20 hover:shadow-2xl hover:-translate-y-1.5 hover:border-blue-400 hover:ring-2 hover:ring-blue-200",
        accentColor,
        "border-t-4",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Verified Shield Icon */}
        {worker.verification_status === 'approved' && (
          <span className="bg-white/90 rounded-full shadow-lg p-1 flex items-center justify-center" title="Verified Worker">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L19 5V11C19 16.52 12 22 12 22C12 22 5 16.52 5 11V5L12 2Z" fill="#22c55e" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M9.5 12.5L11.5 14.5L15 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
        {/* Report Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setReportModalOpen(true); }}
          className="text-muted-foreground bg-white/90 rounded-full shadow-lg p-2 hover:text-red-500 transition-colors"
          title="Report this worker"
        >
          <Flag size={16} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-4 mb-3">
          <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary transition-colors">
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {worker.name ? worker.name.charAt(0).toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">{worker.name}</h3>
              {worker.availability && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" title="Available now"></div>}
            </div>
            <p className="text-muted-foreground text-sm font-medium">{worker.category}</p>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={worker.rating} size={16} />
              <span className="text-xs text-muted-foreground">({worker.numReviews} reviews)</span>
            </div>
            <p className="text-muted-foreground text-xs mt-1">{worker.tags.join(', ')}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            {userLocation == null ? (
              <button onClick={handleKnowDistanceClick} className="text-primary hover:underline font-medium text-left">
                Know the distance
              </button>
            ) : (worker.location && worker.location.latitude && worker.location.longitude ? (
              typeof worker.distance === 'number' ? (
                <span>{`${worker.distance.toFixed(1)} km away`}</span>
              ) : (
                <span>Location not available</span>
              )
            ) : (
              <span>Location not available</span>
            ))}
          </div>
          
          <Button 
            onClick={handleCall}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:animate-pulse"
          >
            <Phone size={16} />
            Call
          </Button>
        </div>
      </div>

      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {worker.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-medium">Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate_behavior">Inappropriate Behavior</SelectItem>
                  <SelectItem value="poor_service">Poor Service Quality</SelectItem>
                  <SelectItem value="fake_profile">Fake Profile</SelectItem>
                  <SelectItem value="spam">Spam or Scam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportReason === 'other' && (
              <div>
                <label className="block mb-1 font-medium">Describe the issue</label>
                <Textarea value={otherReason} onChange={e => setOtherReason(e.target.value)} placeholder="Please describe the issue..." rows={3} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReport} disabled={submittingReport}>{submittingReport ? 'Submitting...' : 'Submit Report'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerCard;
