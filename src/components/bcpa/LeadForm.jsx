import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, FileText } from "lucide-react";

const LEAD_STATUSES = ["New", "Skip Trace", "Contacted", "Offer Made", "Under Contract", "Sold", "Dead Lead"];

export default function LeadForm({ 
  property,
  lead, 
  users,
  isOpen, 
  onClose, 
  onSave, 
  isSaving 
}) {
  const [formData, setFormData] = useState({
    lead_status: 'New',
    assigned_to: '',
    follow_up_date: '',
    notes: '',
    offer_amount: '',
    contract_price: '',
    assignment_fee: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        lead_status: lead.lead_status || 'New',
        assigned_to: lead.assigned_to || '',
        follow_up_date: lead.follow_up_date || '',
        notes: lead.notes || '',
        offer_amount: lead.offer_amount || '',
        contract_price: lead.contract_price || '',
        assignment_fee: lead.assignment_fee || ''
      });
    } else {
      setFormData({
        lead_status: 'New',
        assigned_to: '',
        follow_up_date: '',
        notes: '',
        offer_amount: '',
        contract_price: '',
        assignment_fee: ''
      });
    }
  }, [lead, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      offer_amount: formData.offer_amount ? Number(formData.offer_amount) : null,
      contract_price: formData.contract_price ? Number(formData.contract_price) : null,
      assignment_fee: formData.assignment_fee ? Number(formData.assignment_fee) : null
    };
    onSave(dataToSave);
  };

  const getSitusAddress = () => {
    if (!property) return '';
    const parts = [
      property.situs_street_number,
      property.situs_street_name,
      property.situs_street_type
    ].filter(Boolean);
    return parts.join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {lead ? 'Update Lead' : 'Create Lead'}
          </DialogTitle>
          {property && (
            <p className="text-sm text-slate-600 mt-2">
              {getSitusAddress()} • {property.folio_number}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Status & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_status">Lead Status *</Label>
              <Select value={formData.lead_status} onValueChange={(v) => handleChange('lead_status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select value={formData.assigned_to || ''} onValueChange={(v) => handleChange('assigned_to', v === 'unassigned' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users?.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Follow-up Date */}
          <div className="space-y-2">
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input
              type="date"
              id="follow_up_date"
              value={formData.follow_up_date}
              onChange={(e) => handleChange('follow_up_date', e.target.value)}
            />
          </div>

          {/* Financial Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer_amount">Offer Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  id="offer_amount"
                  type="number"
                  value={formData.offer_amount}
                  onChange={(e) => handleChange('offer_amount', e.target.value)}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_price">Contract Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  id="contract_price"
                  type="number"
                  value={formData.contract_price}
                  onChange={(e) => handleChange('contract_price', e.target.value)}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_fee">Assignment Fee</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  id="assignment_fee"
                  type="number"
                  value={formData.assignment_fee}
                  onChange={(e) => handleChange('assignment_fee', e.target.value)}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add notes about contact attempts, property condition, seller motivation, etc..."
              rows={6}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {lead ? 'Update Lead' : 'Create Lead'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}