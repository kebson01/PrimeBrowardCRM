// Runtime configuration for API URL
// This file is loaded at runtime, not build time
(function() {
  let apiUrl = 'http://127.0.0.1:8000/api'; // Default for local development
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // DigitalOcean App Platform detection
    if (hostname.includes('ondigitalocean.app')) {
      // Try to construct API URL from frontend URL
      // Frontend: primebroward-crm-frontend-xxxxx.ondigitalocean.app
      // API: primebroward-crm-api-xxxxx.ondigitalocean.app
      const parts = hostname.split('.');
      if (parts[0].includes('frontend')) {
        apiUrl = 'https://' + parts[0].replace('frontend', 'api') + '.' + parts.slice(1).join('.') + '/api';
      } else {
        // Fallback: try common pattern
        apiUrl = window.location.origin.replace(/frontend/i, 'api') + '/api';
      }
    }
  }
  
  window.APP_CONFIG = {
    API_URL: apiUrl
  };
})();

