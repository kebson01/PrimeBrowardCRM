// Runtime configuration for API URL
// This file is loaded at runtime, not build time
(function() {
  let apiUrl = 'http://127.0.0.1:8000/api'; // Default for local development
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // DigitalOcean App Platform detection
    if (hostname.includes('ondigitalocean.app')) {
      // Both frontend and API are under the same domain
      // Frontend: https://primebroward-crm-gdyar.ondigitalocean.app/
      // API: https://primebroward-crm-gdyar.ondigitalocean.app/api
      apiUrl = window.location.origin + '/api';
    }
  }
  
  window.APP_CONFIG = {
    API_URL: apiUrl
  };
})();
