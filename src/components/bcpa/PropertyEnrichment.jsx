import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, Home, TrendingUp
} from "lucide-react";

// Expand common Broward County city abbreviations for better geocoding
const expandCityName = (city) => {
  if (!city) return '';
  
  const cityMap = {
    'HW': 'Hollywood',
    'FW': 'Fort Lauderdale',
    'PL': 'Plantation',
    'PM': 'Pompano Beach',
    'DL': 'Deerfield Beach',
    'CO': 'Coral Springs',
    'MR': 'Miramar',
    'PB': 'Pembroke Pines',
    'WS': 'Weston',
    'DA': 'Davie',
    'SS': 'Sunrise',
    'TM': 'Tamarac',
    'LR': 'Lauderhill',
    'OP': 'Oakland Park',
    'WL': 'Wilton Manors',
    'LH': 'Lighthouse Point',
    'DP': 'Dania Beach',
    'HL': 'Hallandale Beach',
    'MB': 'Margate',
    'NP': 'North Lauderdale',
    'CP': 'Coconut Creek',
    'PP': 'Parkland',
    'CS': 'Cooper City',
    'SW': 'Southwest Ranches',
  };
  
  const upperCity = city.toUpperCase().trim();
  return cityMap[upperCity] || city;
};

// Build search URLs for various services
const buildSearchUrls = (property) => {
  if (!property) return {};
  
  // Build street address
  const streetParts = [
    property.situs_street_number,
    property.situs_street_name,
    property.situs_street_type
  ].filter(Boolean);
  
  const streetAddress = streetParts.join(' ');
  
  // Build full address with proper comma separation for better geocoding
  const addressParts = [streetAddress];
  
  if (property.situs_city) {
    // Expand city abbreviation for better geocoding
    const expandedCity = expandCityName(property.situs_city);
    addressParts.push(expandedCity);
  }
  
  addressParts.push('FL');
  
  if (property.situs_zip) {
    addressParts.push(property.situs_zip);
  }
  
  const fullAddress = addressParts.join(', ');
  const encodedAddress = encodeURIComponent(fullAddress);
  const encodedCity = encodeURIComponent(property.situs_city || 'Broward County');
  const encodedZip = encodeURIComponent(property.situs_zip || '');
  
  return {
    // Property Listings
    zillow: `https://www.zillow.com/homes/${encodedAddress}_rb/`,
    redfin: `https://www.redfin.com/search?query=${encodedAddress}`,
    realtor: `https://www.realtor.com/realestateandhomes-search/${encodedAddress.replace(/%20/g, '-')}`,
    trulia: `https://www.trulia.com/for_sale/${encodedAddress.replace(/%20/g, '_')}`,
    
    // REIPro
    reipro: `https://app.myreipro.com/dashboard`,
    reiproSearch: `https://app.myreipro.com/properties?address=${encodedAddress}`,
    
    // Maps
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    googleStreetView: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodedAddress}`,
    
    // Schools
    greatSchools: `https://www.greatschools.org/search/search.page?q=${encodedZip || encodedCity}&gradeLevels=e%2Cm%2Ch`,
    niche: `https://www.niche.com/k12/search/best-schools/?searchType=school&zip=${property.situs_zip || ''}`,
    
    // Property Data
    bcpa: `https://gisweb-adapters.bcpa.net/bcpawebmap_ex_new_web/bcpawebmap.aspx?FOLIO=${property.folio_number}`,
    propertyShark: `https://www.propertyshark.com/mason/Property/${encodedAddress}/`,
    
    // Rentals
    rentometer: `https://www.rentometer.com/analysis/results?address=${encodedAddress}`,
    zillow_rent: `https://www.zillow.com/rental-manager/price-my-rental/results/${encodedAddress.replace(/%20/g, '-')}/`,
  };
};

export default function PropertyEnrichment({ property }) {
  const urls = useMemo(() => buildSearchUrls(property), [property]);
  
  if (!property) return null;

  const fullAddress = [
    property.situs_street_number,
    property.situs_street_name,
    property.situs_street_type
  ].filter(Boolean).join(' ');

  const QuickLink = ({ href, icon: Icon, label, color = "slate" }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] bg-${color}-50 border-${color}-200 text-${color}-700 hover:bg-${color}-100`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
    </a>
  );

  return (
    <div className="space-y-4">
      {/* REIPro - Premium - At the top for easy access */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            REIPro Analysis
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">Premium</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={urls.reipro}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all hover:shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-white hover:from-amber-600 hover:to-orange-600"
          >
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-base">Open REIPro</span>
              <p className="text-xs text-amber-100">Full property analysis, comps & deal calculator</p>
            </div>
            <ExternalLink className="h-5 w-5 opacity-75" />
          </a>
          <p className="mt-2 text-xs text-amber-700 text-center">
            Search for: <span className="font-mono bg-amber-100 px-1 rounded">{fullAddress}</span>
          </p>
        </CardContent>
      </Card>

      {/* Quick Links - Property Listings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-600" />
            Property Listings & Values
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <a
            href={urls.zillow}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Zillow</span>
              <p className="text-xs text-blue-600">Zestimate & Details</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
          
          <a
            href={urls.redfin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Redfin</span>
              <p className="text-xs text-red-600">Estimate & History</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
          
          <a
            href={urls.realtor}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <div className="h-6 w-6 rounded bg-orange-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Realtor.com</span>
              <p className="text-xs text-orange-600">Listings & Data</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
          
          <a
            href={urls.bcpa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
          >
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">BCPA</span>
              <p className="text-xs text-emerald-600">Official Records</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

