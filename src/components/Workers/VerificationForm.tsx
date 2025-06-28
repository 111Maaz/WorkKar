import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X } from 'lucide-react';

interface VerificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: number;
  onSuccess?: () => void;
}

interface VerificationData {
  documentType: 'aadhar' | 'pan';
  // Aadhar fields
  aadharName: string;
  aadharDob: string;
  aadharGender: 'male' | 'female' | 'other';
  aadharNumber: string;
  aadharVid: string;
  aadharImage: File | null;
  // PAN fields
  panName: string;
  panDob: string;
  panParentName: string;
  panNumber: string;
  panImage: File | null;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  isOpen,
  onClose,
  workerId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VerificationData>({
    documentType: 'aadhar',
    aadharName: '',
    aadharDob: '',
    aadharGender: 'male',
    aadharNumber: '',
    aadharVid: '',
    aadharImage: null,
    panName: '',
    panDob: '',
    panParentName: '',
    panNumber: '',
    panImage: null,
  });

  const handleInputChange = (field: keyof VerificationData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (formData.documentType === 'aadhar') {
      if (!formData.aadharName || !formData.aadharDob || !formData.aadharGender) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required Aadhar fields.",
          variant: "destructive"
        });
        return false;
      }
      if (!formData.aadharNumber && !formData.aadharVid) {
        toast({
          title: "Missing Information",
          description: "Please provide either Aadhar number or VID.",
          variant: "destructive"
        });
        return false;
      }
      if (formData.aadharNumber && formData.aadharNumber.length !== 12) {
        toast({
          title: "Invalid Aadhar Number",
          description: "Aadhar number must be 12 digits.",
          variant: "destructive"
        });
        return false;
      }
      if (formData.aadharVid && formData.aadharVid.length !== 16) {
        toast({
          title: "Invalid VID",
          description: "VID must be 16 digits.",
          variant: "destructive"
        });
        return false;
      }
    } else {
      if (!formData.panName || !formData.panDob || !formData.panParentName || !formData.panNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required PAN fields.",
          variant: "destructive"
        });
        return false;
      }
      if (formData.panNumber.length !== 10) {
        toast({
          title: "Invalid PAN Number",
          description: "PAN number must be 10 characters.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare the data based on document type
      const verificationData: any = {
        worker_id: workerId,
        user_id: user.id,
        document_type: formData.documentType,
        status: 'pending'
      };

      if (formData.documentType === 'aadhar') {
        verificationData.aadhar_name = formData.aadharName;
        verificationData.aadhar_dob = formData.aadharDob;
        verificationData.aadhar_gender = formData.aadharGender;
        verificationData.aadhar_number = formData.aadharNumber || null;
        verificationData.aadhar_vid = formData.aadharVid || null;
        // Note: Image upload is not implemented as it requires paid service
        // verificationData.aadhar_image_url = uploadedImageUrl;
      } else {
        verificationData.pan_name = formData.panName;
        verificationData.pan_dob = formData.panDob;
        verificationData.pan_parent_name = formData.panParentName;
        verificationData.pan_number = formData.panNumber;
        // Note: Image upload is not implemented as it requires paid service
        // verificationData.pan_image_url = uploadedImageUrl;
      }

      const { error } = await supabase
        .from('verification_requests')
        .insert(verificationData);

      if (error) throw error;

      toast({
        title: "Verification Request Submitted!",
        description: "Your verification request has been submitted successfully. We'll review it and get back to you soon.",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error submitting verification request:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      documentType: 'aadhar',
      aadharName: '',
      aadharDob: '',
      aadharGender: 'male',
      aadharNumber: '',
      aadharVid: '',
      aadharImage: null,
      panName: '',
      panDob: '',
      panParentName: '',
      panNumber: '',
      panImage: null,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Become a Verified Professional</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Document Type Selection */}
          <div>
            <Label htmlFor="documentType" className="text-base font-medium">Select Document Type</Label>
            <Select value={formData.documentType} onValueChange={(value: 'aadhar' | 'pan') => handleInputChange('documentType', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhar">Aadhar Card</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.documentType === 'aadhar' ? (
            /* Aadhar Card Form */
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aadhar Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="aadharName">Full Name *</Label>
                  <Input
                    id="aadharName"
                    value={formData.aadharName}
                    onChange={(e) => handleInputChange('aadharName', e.target.value)}
                    placeholder="Enter name as on Aadhar card"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="aadharDob">Date of Birth *</Label>
                  <Input
                    id="aadharDob"
                    type="date"
                    value={formData.aadharDob}
                    onChange={(e) => handleInputChange('aadharDob', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="aadharGender">Gender *</Label>
                  <Select value={formData.aadharGender} onValueChange={(value: 'male' | 'female' | 'other') => handleInputChange('aadharGender', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Identification Number *</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="aadharNumber" className="text-sm">Aadhar Number (12 digits)</Label>
                      <Input
                        id="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                        placeholder="1234 5678 9012"
                        maxLength={12}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="aadharVid" className="text-sm">OR VID (16 digits)</Label>
                      <Input
                        id="aadharVid"
                        value={formData.aadharVid}
                        onChange={(e) => handleInputChange('aadharVid', e.target.value)}
                        placeholder="1234567890123456"
                        maxLength={16}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Provide either Aadhar number or VID</p>
                </div>

                <div>
                  <Label htmlFor="aadharImage" className="flex items-center gap-2">
                    <Upload size={16} />
                    Document Image (Optional)
                  </Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Image upload service is not available at the moment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* PAN Card Form */
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PAN Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="panName">Full Name *</Label>
                  <Input
                    id="panName"
                    value={formData.panName}
                    onChange={(e) => handleInputChange('panName', e.target.value)}
                    placeholder="Enter name as on PAN card"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="panDob">Date of Birth *</Label>
                  <Input
                    id="panDob"
                    type="date"
                    value={formData.panDob}
                    onChange={(e) => handleInputChange('panDob', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="panParentName">Father/Mother Name *</Label>
                  <Input
                    id="panParentName"
                    value={formData.panParentName}
                    onChange={(e) => handleInputChange('panParentName', e.target.value)}
                    placeholder="Enter father or mother name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: ABCDE1234F (10 characters)</p>
                </div>

                <div>
                  <Label htmlFor="panImage" className="flex items-center gap-2">
                    <Upload size={16} />
                    Document Image (Optional)
                  </Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Image upload service is not available at the moment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• All information provided will be kept confidential and secure</li>
              <li>• Verification process typically takes 2-3 business days</li>
              <li>• You will be notified via email once your verification is complete</li>
              <li>• Only verified professionals can display the verification badge</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Verification Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationForm;