import React, { useState, useEffect, useMemo } from 'react';
import { api, properties as propertiesApi, leads as leadsApi } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, FileSpreadsheet, Filter, Sparkles, ChevronLeft, ChevronRight, Mail, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import PropertyFilters from '../components/bcpa/PropertyFilters';
import PropertyTable from '../components/bcpa/PropertyTable';
import PropertyDetail from '../components/bcpa/PropertyDetail';
import LeadForm from '../components/bcpa/LeadForm';
import StatsCards from '../components/bcpa/StatsCards';
import ImportExport from '../components/bcpa/ImportExport';
import LetterComposer from '../components/bcpa/LetterComposer';
import BulkLetterGenerator from '../components/bcpa/BulkLetterGenerator';

const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [sortField, setSortField] = useState('created_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showLetterComposer, setShowLetterComposer] = useState(false);
  const [letterProperty, setLetterProperty] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showBulkLetterGenerator, setShowBulkLetterGenerator] = useState(false);

  useEffect(() => {
    api.auth.me().then(setUser);
  }, []);

  // Build query params for server-side filtering
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    sort: sortField,
    order: sortDirection,
    search: appliedFilters.search || undefined,
    city: appliedFilters.city || undefined,
    zip: appliedFilters.zip || undefined,
    use_type: appliedFilters.use_type !== 'all' ? appliedFilters.use_type : undefined,
    lead_status: appliedFilters.lead_status !== 'all' ? appliedFilters.lead_status : undefined,
    absentee: appliedFilters.absentee !== 'all' ? appliedFilters.absentee : undefined,
    homestead: appliedFilters.homestead !== 'all' ? appliedFilters.homestead : undefined,
    min_value: appliedFilters.min_value || undefined,
    max_value: appliedFilters.max_value || undefined,
    min_equity: appliedFilters.min_equity || undefined,
    min_year: appliedFilters.min_year || undefined,
    max_year: appliedFilters.max_year || undefined,
  }), [currentPage, pageSize, sortField, sortDirection, appliedFilters]);

  // Fetch properties with server-side pagination
  const { data: propertiesData, isLoading: loadingProperties, refetch } = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => propertiesApi.list(queryParams),
    keepPreviousData: true,
  });

  const properties = propertiesData?.data || [];
  const totalProperties = propertiesData?.total || 0;
  const totalPages = Math.ceil(totalProperties / pageSize);

  // Fetch stats separately (not paginated)
  const { data: stats = {} } = useQuery({
    queryKey: ['propertyStats'],
    queryFn: () => propertiesApi.getStats(),
  });

  // Fetch leads for the current properties
  const { data: leadsData } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.list({ limit: 10000 }),
  });
  const leads = leadsData?.data || [];

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list('full_name', 100),
    enabled: user?.role === 'admin',
  });

  // Create lead index for quick lookup
  const leadsByFolio = useMemo(() => {
    const index = {};
    leads.forEach(lead => {
      index[lead.folio_number] = lead;
    });
    return index;
  }, [leads]);

  // Mutations
  const createLeadMutation = useMutation({
    mutationFn: (data) => leadsApi.create({
      ...data,
      folio_number: editingProperty.folio_number,
      property_address: [
        editingProperty.situs_street_number,
        editingProperty.situs_street_name,
        editingProperty.situs_street_type
      ].filter(Boolean).join(' '),
      owner_name: editingProperty.name_line_1,
      updated_by_name: user?.full_name || user?.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['propertyStats'] });
      setShowLeadForm(false);
      setEditingProperty(null);
      setEditingLead(null);
      toast.success('Lead created successfully');
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => leadsApi.update(id, {
      ...data,
      updated_by_name: user?.full_name || user?.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['propertyStats'] });
      setShowLeadForm(false);
      setEditingProperty(null);
      setEditingLead(null);
      toast.success('Lead updated successfully');
    },
  });

  // Combine properties with lead data
  const propertiesWithLeads = useMemo(() => {
    return properties.map(prop => ({
      ...prop,
      lead_status: prop.lead_status || leadsByFolio[prop.folio_number]?.lead_status || null,
      lead_id: prop.lead_id || leadsByFolio[prop.folio_number]?.id || null
    }));
  }, [properties, leadsByFolio]);

  // Format stats for display
  const displayStats = useMemo(() => ({
    total: stats.total || 0,
    newLeads: stats.new_leads || 0,
    underContract: stats.under_contract || 0,
    sold: stats.sold || 0,
    highEquity: stats.high_equity || 0,
    absentee: stats.absentee || 0,
  }), [stats]);

  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleResetFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setSelectedLead(leadsByFolio[property.folio_number] || null);
    setShowDetail(true);
  };

  const handleEditLead = (property, lead) => {
    setEditingProperty(property);
    setEditingLead(lead);
    setShowDetail(false);
    setShowLeadForm(true);
  };

  const handleComposeLetter = (property) => {
    setLetterProperty(property);
    setShowDetail(false);
    setShowLetterComposer(true);
  };

  // Bulk selection handlers
  const handleSelectProperty = (property, checked) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, property]);
    } else {
      setSelectedProperties(prev => prev.filter(p => p.folio_number !== property.folio_number));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProperties(propertiesWithLeads || []);
    } else {
      setSelectedProperties([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedProperties([]);
  };

  const handleBulkLetter = () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select at least one property');
      return;
    }
    setShowBulkLetterGenerator(true);
  };

  const handleSaveLead = (data) => {
    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, data });
    } else {
      createLeadMutation.mutate(data);
    }
  };

  // Calculate page range for display
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalProperties);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Property Dashboard
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Live</span>
              </div>
            </div>
            <p className="text-slate-500 mt-1">
              Manage your Broward County wholesale real estate leads
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="border-slate-200 hover:bg-white hover:border-slate-300 rounded-xl shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowImportExport(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import / Export
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StatsCards stats={displayStats} />
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <PropertyFilters
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            onReset={handleResetFilters}
          />
        </motion.div>

        {/* Results count and pagination controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startRecord.toLocaleString()}</span> - {' '}
              <span className="font-semibold text-slate-700">{endRecord.toLocaleString()}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalProperties.toLocaleString()}</span> properties
            </p>
            {Object.keys(appliedFilters).filter(k => appliedFilters[k] && appliedFilters[k] !== 'all').length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters} 
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Show:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-24 h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="font-semibold">{selectedProperties.length} properties selected</p>
                      <p className="text-sm text-white/80">Ready for bulk actions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleClearSelection}
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBulkLetter}
                      className="bg-white text-violet-600 hover:bg-white/90"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Generate Letters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <PropertyTable
            properties={propertiesWithLeads}
            isLoading={loadingProperties}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onViewProperty={handleViewProperty}
            onComposeLetter={handleComposeLetter}
            selectedProperties={selectedProperties}
            onSelectProperty={handleSelectProperty}
            onSelectAll={handleSelectAll}
          />
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalPages.toLocaleString()}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="hidden sm:flex rounded-lg"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {/* Page number buttons */}
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 rounded-lg ${currentPage === pageNum ? 'bg-blue-600' : ''}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="hidden sm:flex rounded-lg"
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PropertyDetail
        property={selectedProperty}
        lead={selectedLead}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedProperty(null);
          setSelectedLead(null);
        }}
        onEditLead={handleEditLead}
        onComposeLetter={handleComposeLetter}
      />

      <LeadForm
        property={editingProperty}
        lead={editingLead}
        users={users}
        isOpen={showLeadForm}
        onClose={() => {
          setShowLeadForm(false);
          setEditingProperty(null);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        isSaving={createLeadMutation.isPending || updateLeadMutation.isPending}
      />

      <ImportExport
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImportComplete={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['propertyStats'] });
        }}
        properties={propertiesWithLeads}
        totalCount={totalProperties}
        user={user}
      />

      <LetterComposer
        property={letterProperty}
        isOpen={showLetterComposer}
        onClose={() => {
          setShowLetterComposer(false);
          setLetterProperty(null);
        }}
      />

      <BulkLetterGenerator
        properties={selectedProperties}
        isOpen={showBulkLetterGenerator}
        onClose={() => setShowBulkLetterGenerator(false)}
        onComplete={() => {
          setSelectedProperties([]);
        }}
      />
    </div>
  );
}
