import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const LEAD_STATUSES = ["New", "Skip Trace", "Contacted", "Offer Made", "Under Contract", "Sold", "Dead Lead"];
const USE_TYPES = ["Single Family", "Multi-Family", "Condo", "Townhouse", "Land", "Commercial", "Other"];

export default function PropertyFilters({ filters, setFilters, onSearch, onReset }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    return value && value !== '' && value !== 'all';
  }).length;

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search owner, parcel #, address, city, zip..."
                value={filters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="pl-11 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 focus:bg-white transition-colors text-base"
              />
            </div>
            <Button 
              onClick={onSearch} 
              className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 rounded-xl shadow-md shadow-blue-500/20"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filter Toggle */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="h-10 hover:bg-slate-100 rounded-xl gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 bg-blue-600 hover:bg-blue-700 text-xs px-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 hover:text-slate-700 rounded-lg">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
                {/* Lead Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Status</Label>
                  <Select value={filters.lead_status || 'all'} onValueChange={(v) => handleChange('lead_status', v)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Statuses</SelectItem>
                      {LEAD_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Use Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Type</Label>
                  <Select value={filters.use_type || 'all'} onValueChange={(v) => handleChange('use_type', v)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Types</SelectItem>
                      {USE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</Label>
                  <Input
                    placeholder="e.g., Fort Lauderdale"
                    value={filters.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                {/* ZIP */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ZIP Code</Label>
                  <Input
                    placeholder="e.g., 33301"
                    value={filters.zip || ''}
                    onChange={(e) => handleChange('zip', e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                {/* Absentee Owner */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner Type</Label>
                  <Select value={filters.absentee || 'all'} onValueChange={(v) => handleChange('absentee', v)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white">
                      <SelectValue placeholder="All Owners" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Owners</SelectItem>
                      <SelectItem value="true">Absentee Owner</SelectItem>
                      <SelectItem value="false">Owner Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Homestead */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Homestead</Label>
                  <Select value={filters.homestead || 'all'} onValueChange={(v) => handleChange('homestead', v)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="true">Has Homestead</SelectItem>
                      <SelectItem value="false">No Homestead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Just Value */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Min Value</Label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={filters.min_value || ''}
                    onChange={(e) => handleChange('min_value', e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                {/* Max Just Value */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Value</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.max_value || ''}
                    onChange={(e) => handleChange('max_value', e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                {/* Min Equity */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Min Equity</Label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={filters.min_equity || ''}
                    onChange={(e) => handleChange('min_equity', e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                {/* Year Built Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year Built (Min)</Label>
                  <Input
                    type="number"
                    placeholder="1900"
                    value={filters.min_year || ''}
                    onChange={(e) => handleChange('min_year', e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year Built (Max)</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={filters.max_year || ''}
                    onChange={(e) => handleChange('max_year', e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                {/* Follow-up Due */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Follow-up</Label>
                  <Select value={filters.followup || 'all'} onValueChange={(v) => handleChange('followup', v)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="today">Due Today</SelectItem>
                      <SelectItem value="week">Due This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
