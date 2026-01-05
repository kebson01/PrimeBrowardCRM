import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, User, Building, Calendar, DollarSign, FileText, 
  TrendingUp, Edit, Home, Mail, AlertCircle, ExternalLink, Send
} from "lucide-react";
import LeadStatusBadge from "./LeadStatusBadge";
import FinancialAnalysis from "./FinancialAnalysis";
import PropertyEnrichment from "./PropertyEnrichment";
import { format } from "date-fns";

// BCPA Website URL for property lookup
const BCPA_URL = "https://gisweb-adapters.bcpa.net/bcpawebmap_ex_new_web/bcpawebmap.aspx?FOLIO=";

export default function PropertyDetail({ 
  property, 
  lead,
  isOpen, 
  onClose, 
  onEditLead,
  onComposeLetter
}) {
  if (!property) return null;

  const formatCurrency = (value) => {
    if (!value || value === 0) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return '—';
    return value.toLocaleString();
  };

  const getSitusAddress = () => {
    const parts = [
      property.situs_street_number,
      property.situs_street_name,
      property.situs_street_type
    ].filter(Boolean);
    return parts.join(' ') || 'N/A';
  };

  const getMailingAddress = () => {
    const lines = [];
    if (property.mailing_address_line_1) lines.push(property.mailing_address_line_1);
    if (property.mailing_address_line_2) lines.push(property.mailing_address_line_2);
    const cityState = [property.mailing_city, property.mailing_state].filter(Boolean).join(', ');
    if (cityState) lines.push(`${cityState} ${property.mailing_zip || ''}`);
    return lines.length > 0 ? lines : ['N/A'];
  };

  const InfoRow = ({ icon: Icon, label, value, highlight }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`font-medium truncate ${highlight ? 'text-blue-600' : 'text-slate-800'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );

  const equityPercentage = property.estimated_purchase_price > 0 
    ? ((property.potential_equity / property.estimated_purchase_price) * 100).toFixed(1)
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-4 bg-gradient-to-br from-blue-50 to-slate-50 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <SheetTitle className="text-xl font-bold text-slate-900">
                  {getSitusAddress()}
                </SheetTitle>
                {property.is_absentee_owner && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Absentee
                  </Badge>
                )}
              </div>
              <p className="text-slate-600">
                {property.situs_city}, FL {property.situs_zip}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-500 font-mono">
                  Folio: {property.folio_number}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  onClick={() => window.open(`${BCPA_URL}${property.folio_number}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  BCPA
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100"
                  onClick={() => onComposeLetter?.(property)}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Letter
                </Button>
              </div>
            </div>
            <LeadStatusBadge status={lead?.lead_status} />
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-6">
            <Tabs defaultValue="property" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="property">Property</TabsTrigger>
                <TabsTrigger value="owner">Owner</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="research">Research</TabsTrigger>
                <TabsTrigger value="lead">Lead</TabsTrigger>
              </TabsList>

              {/* Property Tab */}
              <TabsContent value="property" className="space-y-6">
                <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-1">
                  <InfoRow icon={Building} label="Use Type" value={property.use_type} />
                  <InfoRow icon={Building} label="Use Code" value={property.use_code} />
                  <InfoRow icon={Calendar} label="Year Built" value={property.bldg_year_built} />
                  <InfoRow icon={Home} label="Square Footage" value={formatNumber(property.bldg_tot_sq_footage)} />
                  <InfoRow icon={Home} label="Bedrooms" value={property.beds} />
                  <InfoRow icon={Home} label="Bathrooms" value={property.baths} />
                  {property.homestead_flag && (
                    <div className="flex items-center gap-2 pt-2">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        Homestead Exemption
                      </Badge>
                      {property.exemption_amount > 0 && (
                        <span className="text-sm text-slate-600">
                          {formatCurrency(property.exemption_amount)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Owner Tab */}
              <TabsContent value="owner" className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Owner Information
                  </h3>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-1">
                    <div className="py-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Owner Name</p>
                      <p className="font-medium text-slate-800">{property.name_line_1 || '—'}</p>
                      {property.name_line_2 && (
                        <p className="font-medium text-slate-800">{property.name_line_2}</p>
                      )}
                    </div>
                    <Separator />
                    <InfoRow 
                      icon={MapPin} 
                      label="Owner Domicile" 
                      value={property.owners_domicile || 'Unknown'} 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Mailing Address
                  </h3>
                  <div className="bg-white border border-slate-100 rounded-xl p-4">
                    {property.is_absentee_owner && (
                      <div className="flex items-start gap-2 mb-3 p-2 bg-orange-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <p className="text-sm text-orange-700">
                          Mailing address differs from property address
                        </p>
                      </div>
                    )}
                    {getMailingAddress().map((line, idx) => (
                      <p key={idx} className="text-slate-700">{line}</p>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-6">
                <FinancialAnalysis property={property} />
              </TabsContent>

              {/* Research Tab */}
              <TabsContent value="research" className="space-y-6">
                <PropertyEnrichment property={property} />
              </TabsContent>

              {/* Lead Tab */}
              <TabsContent value="lead" className="space-y-6">
                {lead ? (
                  <>
                    <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Lead Details</h3>
                        <Button size="sm" variant="outline" onClick={() => onEditLead(property, lead)}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <Separator />
                      <InfoRow icon={FileText} label="Status" value={<LeadStatusBadge status={lead.lead_status} />} />
                      <InfoRow icon={User} label="Assigned To" value={lead.assigned_to || 'Unassigned'} />
                      {lead.follow_up_date && (
                        <InfoRow 
                          icon={Calendar} 
                          label="Follow-up Date" 
                          value={format(new Date(lead.follow_up_date), 'MMM d, yyyy')} 
                        />
                      )}
                      {lead.offer_amount && (
                        <InfoRow icon={DollarSign} label="Offer Amount" value={formatCurrency(lead.offer_amount)} />
                      )}
                      {lead.contract_price && (
                        <InfoRow icon={DollarSign} label="Contract Price" value={formatCurrency(lead.contract_price)} />
                      )}
                      {lead.assignment_fee && (
                        <InfoRow icon={DollarSign} label="Assignment Fee" value={formatCurrency(lead.assignment_fee)} />
                      )}
                      {lead.notes && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.notes}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600 mb-4">No lead created for this property</p>
                    <Button size="sm" onClick={() => onEditLead(property, null)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Create Lead
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}