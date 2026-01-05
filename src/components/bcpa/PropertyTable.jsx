import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, ChevronUp, ChevronDown, Home, MapPin, User, DollarSign, Building2, ExternalLink, Mail } from "lucide-react";
import LeadStatusBadge from "./LeadStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// BCPA Website URL for property lookup
const BCPA_URL = "https://gisweb-adapters.bcpa.net/bcpawebmap_ex_new_web/bcpawebmap.aspx?FOLIO=";

export default function PropertyTable({ 
  properties, 
  isLoading, 
  sortField, 
  sortDirection, 
  onSort, 
  onViewProperty,
  onComposeLetter,
  selectedProperties = [],
  onSelectProperty,
  onSelectAll
}) {
  const SortHeader = ({ field, children }) => (
    <TableHead 
      className="cursor-pointer hover:bg-slate-100/50 transition-colors select-none whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortField === field && (
          <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-100">
            {sortDirection === 'asc' ? 
              <ChevronUp className="h-3.5 w-3.5 text-blue-600" /> : 
              <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
            }
          </span>
        )}
      </div>
    </TableHead>
  );

  const formatCurrency = (value) => {
    if (!value || value === 0) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const getFullAddress = (prop) => {
    const parts = [
      prop.situs_street_number,
      prop.situs_street_name,
      prop.situs_street_type
    ].filter(Boolean);
    return parts.join(' ') || '—';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!properties?.length) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <Building2 className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No properties found</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Try adjusting your search criteria or import some property data to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={properties?.length > 0 && selectedProperties.length === properties.length}
                  onCheckedChange={(checked) => onSelectAll?.(checked)}
                  aria-label="Select all"
                  className="border-slate-300"
                />
              </TableHead>
              <SortHeader field="folio_number">Folio #</SortHeader>
              <SortHeader field="name_line_1">
                <User className="h-4 w-4 text-slate-400" />
                Owner
              </SortHeader>
              <SortHeader field="situs_street_name">
                <MapPin className="h-4 w-4 text-slate-400" />
                Property Address
              </SortHeader>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead className="hidden xl:table-cell">Type</TableHead>
              <SortHeader field="just_value">
                <DollarSign className="h-4 w-4 text-slate-400" />
                Value
              </SortHeader>
              <SortHeader field="potential_equity">Equity</SortHeader>
              <TableHead>Flags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property, index) => {
              const equityValue = property.potential_equity || 0;
              const equityColor = equityValue >= 100000 ? 'text-emerald-600 font-semibold' : 
                                  equityValue >= 50000 ? 'text-green-600 font-medium' : 
                                  'text-slate-600';

              return (
                <TableRow 
                  key={property.id || index} 
                  className={`hover:bg-blue-50/30 cursor-pointer transition-colors group ${
                    selectedProperties.some(p => p.folio_number === property.folio_number) 
                      ? 'bg-violet-50/50' 
                      : ''
                  }`}
                  onClick={() => onViewProperty(property)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedProperties.some(p => p.folio_number === property.folio_number)}
                      onCheckedChange={(checked) => onSelectProperty?.(property, checked)}
                      aria-label={`Select ${property.folio_number}`}
                      className="border-slate-300"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {property.folio_number || '—'}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="font-medium text-slate-900 truncate">
                      {property.name_line_1 || '—'}
                    </div>
                    {property.name_line_2 && (
                      <div className="text-xs text-slate-500 truncate">{property.name_line_2}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-slate-700 font-medium">{getFullAddress(property)}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-500 text-sm">
                    {property.situs_city || '—'}, {property.situs_zip || '—'}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <span className="text-sm text-slate-600 px-2 py-1 bg-slate-100 rounded-md">
                      {property.use_type || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    {formatCurrency(property.just_value)}
                  </TableCell>
                  <TableCell className={equityColor}>
                    {formatCurrency(property.potential_equity)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {property.is_absentee_owner && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 font-medium">
                          Absentee
                        </Badge>
                      )}
                      {property.homestead_flag && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
                          HS
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <LeadStatusBadge status={property.lead_status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewProperty(property);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                onComposeLetter?.(property);
                              }}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Compose Letter</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`${BCPA_URL}${property.folio_number}`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View on BCPA Website</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
