/**
 * API Client for PrimeBroward CRM
 * Connects to the Python FastAPI backend
 */

// Get API URL from environment variable (build time) or runtime config
const getApiUrl = () => {
  // First, try build-time environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Then, try runtime config (for production)
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_URL) {
    return window.APP_CONFIG.API_URL;
  }
  
  // Fallback to localhost for development
  return 'http://127.0.0.1:8000/api';
};

const API_URL = getApiUrl();

/**
 * Make an API request
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }
    
    // Handle file downloads
    const contentType = response.headers.get('content-type');
    if (contentType && (contentType.includes('text/csv') || contentType.includes('application/pdf'))) {
      return response.blob();
    }
    
    return response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Build query string from params object
 */
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      searchParams.append(key, value);
    }
  }
  return searchParams.toString();
}

// ============================================================================
// Properties API
// ============================================================================
export const properties = {
  /**
   * List properties with filters and pagination
   */
  list: async (params = {}) => {
    const query = buildQueryString(params);
    return request(`/properties?${query}`);
  },
  
  /**
   * Get a single property by folio number
   */
  get: async (folioNumber) => {
    return request(`/properties/${encodeURIComponent(folioNumber)}`);
  },
  
  /**
   * Get property statistics
   */
  getStats: async () => {
    return request('/properties/stats');
  },
  
  /**
   * Get list of unique cities
   */
  getCities: async () => {
    return request('/properties/cities');
  },
  
  /**
   * Get list of unique use types
   */
  getUseTypes: async () => {
    return request('/properties/use-types');
  },
};

// ============================================================================
// Leads API
// ============================================================================
export const leads = {
  /**
   * List leads with filters
   */
  list: async (params = {}) => {
    const query = buildQueryString(params);
    return request(`/leads?${query}`);
  },
  
  /**
   * Get a single lead by ID
   */
  get: async (leadId) => {
    return request(`/leads/${leadId}`);
  },
  
  /**
   * Get lead by property folio number
   */
  getByFolio: async (folioNumber) => {
    return request(`/leads/folio/${encodeURIComponent(folioNumber)}`);
  },
  
  /**
   * Create a new lead
   */
  create: async (data) => {
    return request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update an existing lead
   */
  update: async (leadId, data) => {
    return request(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Delete a lead
   */
  delete: async (leadId) => {
    return request(`/leads/${leadId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Letters API
// ============================================================================
export const letters = {
  /**
   * Get all letter templates
   */
  getTemplates: async () => {
    return request('/letters/templates');
  },
  
  /**
   * Get a single template
   */
  getTemplate: async (templateId) => {
    return request(`/letters/templates/${templateId}`);
  },
  
  /**
   * Create a new template
   */
  createTemplate: async (data) => {
    return request('/letters/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update a template
   */
  updateTemplate: async (templateId, data) => {
    return request(`/letters/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Delete a template
   */
  deleteTemplate: async (templateId) => {
    return request(`/letters/templates/${templateId}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Generate a letter for a single property
   */
  generate: async (folioNumber, templateId, outputFormat = 'pdf') => {
    return request('/letters/generate', {
      method: 'POST',
      body: JSON.stringify({
        folio_number: folioNumber,
        template_id: templateId,
        output_format: outputFormat,
      }),
    });
  },
  
  /**
   * Generate letters for multiple properties
   */
  generateBulk: async (folioNumbers, templateId, outputFormat = 'pdf') => {
    return request('/letters/generate-bulk', {
      method: 'POST',
      body: JSON.stringify({
        folio_numbers: folioNumbers,
        template_id: templateId,
        output_format: outputFormat,
      }),
    });
  },
  
  /**
   * Get download URL for a letter
   */
  getDownloadUrl: (filename) => {
    return `${API_URL}/letters/download/${filename}`;
  },
  
  /**
   * Get letter generation history
   */
  getHistory: async (folioNumber = null) => {
    const query = folioNumber ? `?folio_number=${encodeURIComponent(folioNumber)}` : '';
    return request(`/letters/history${query}`);
  },
};

// ============================================================================
// Import/Export API
// ============================================================================
export const importExport = {
  /**
   * Import a CSV file (via file upload)
   */
  importCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/import-export/import`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Import failed');
    }
    
    return response.json();
  },
  
  /**
   * Import a CSV from a local file path
   */
  importFromPath: async (filePath) => {
    return request(`/import-export/import-from-path?file_path=${encodeURIComponent(filePath)}`, {
      method: 'POST',
    });
  },
  
  /**
   * Export properties to CSV
   */
  exportCSV: async (filters = {}) => {
    const query = buildQueryString(filters);
    const blob = await request(`/import-export/export?${query}`);
    
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bcpa_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  },
  
  /**
   * Get expected CSV headers
   */
  getSampleHeaders: async () => {
    return request('/import-export/sample-headers');
  },
};

// ============================================================================
// Auth (simplified for local app)
// ============================================================================
export const auth = {
  me: async () => ({
    id: 1,
    email: 'local@primebroward.com',
    full_name: 'Local User',
    role: 'admin',
  }),
  logout: () => {},
};

// ============================================================================
// Backward-compatible API object (matches old base44 structure)
// ============================================================================
export const api = {
  auth,
  properties,
  leads,
  letters,
  importExport,
  
  // Legacy compatibility
  entities: {
    Property: {
      list: async (sort, limit) => {
        const order = sort?.startsWith('-') ? 'desc' : 'asc';
        const sortField = sort?.replace('-', '') || 'created_date';
        const result = await properties.list({ sort: sortField, order, limit });
        return result.data;
      },
      get: properties.get,
    },
    Lead: {
      list: async (sort, limit) => {
        const order = sort?.startsWith('-') ? 'desc' : 'asc';
        const sortField = sort?.replace('-', '') || 'updated_date';
        const result = await leads.list({ sort: sortField, order, limit });
        return result.data;
      },
      create: leads.create,
      update: (id, data) => leads.update(id, data),
      delete: leads.delete,
    },
    User: {
      list: async () => [{ id: 1, email: 'local@primebroward.com', full_name: 'Local User' }],
    },
  },
};

// Default export for backward compatibility
export default api;



